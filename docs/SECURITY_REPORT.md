# AcadeX – Security Report

## Executive Summary

AcadeX implements a defence-in-depth security strategy across five distinct layers: network, session, application, database, and audit. All sensitive operations are authenticated, role-verified, and permanently logged. This report documents the implemented security controls, their rationale, and their current status.

---

## 1. Authentication

### 1.1 Session Management

AcadeX uses Supabase Auth as the identity provider. Sessions are managed using HttpOnly cookies via the `@supabase/ssr` package, which prevents JavaScript access to session tokens.

| Control | Implementation | Status |
|---------|---------------|--------|
| HttpOnly session cookie | `@supabase/ssr` cookie handler | ✅ |
| Session validated on every server request | `createServerClient()` in every Server Component and API Route | ✅ |
| Automatic session expiry | Supabase Auth default (1 hour access token, sliding refresh) | ✅ |
| Logout clears cookie | `POST /api/auth/logout` → `supabase.auth.signOut()` | ✅ |

### 1.2 Multi-Factor Authentication (MFA)

TOTP-based MFA is available for all users and enforced for administrative operations.

```
Login flow with MFA:
  POST /api/auth/login
    → supabase.auth.signInWithPassword()
    → Detect MFA enrollment → redirect /mfa
  POST /api/auth/mfa/verify
    → supabase.auth.verifyTotp()
    → Session upgraded to MFA-confirmed
```

### 1.3 Rate Limiting

The login endpoint implements IP-based rate limiting to prevent brute-force attacks.

```
Window: 60 seconds
Limit: 10 attempts per IP
Block duration: 5 minutes
Implementation: in-memory Map (single instance)
Production note: replace with Redis/Vercel KV for multi-instance deployments
```

### 1.4 Password Reset

Handled by Supabase Auth email link flow. Reset links expire after a configured time window.

---

## 2. Authorization

### 2.1 Role-Based Access Control (RBAC)

Three roles are defined and enforced:

| Role | Scope |
|------|-------|
| `admin` | Full platform access |
| `faculty` | Own assigned sections only |
| `student` | Own team and section only |

Role is stored in the `profiles.role` column and read from the database on every request (not from the JWT alone).

### 2.2 Server-Side Authorization Guards

All API routes call at least one authorization function before executing business logic:

```typescript
// 1. Verify session and role
const { userId, role } = await requireRole(supabase, ['faculty']);

// 2. Verify section assignment (faculty)
await requireFacultyAssignment(supabase, userId, { sectionId });

// 3. Verify resource ownership (student)
await requireOwnerOrAdmin(supabase, userId, resourceOwnerId);
```

None of these checks can be bypassed from the client side.

### 2.3 Page-Level Guards

All portal pages use `requirePageRole()` from `src/lib/supabase/helpers.ts`:
```typescript
const { userId } = await requirePageRole('student');
```
This redirects to `/login` if no session exists, or to the user's correct portal if the role doesn't match.

---

## 3. Database Security

### 3.1 Row-Level Security (RLS)

Every table in the database has RLS enabled. Policies are defined in `019_rls_policies.sql` and `026_missing_rls_policies.sql`.

**RLS ensures that even if application-level auth were bypassed, the database would still reject unauthorized reads/writes.**

Key RLS policy examples:

```sql
-- Students can only SELECT their own record
CREATE POLICY "students_select_own"
  ON students FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Faculty can read students in their assigned sections
CREATE POLICY "faculty_read_section_students"
  ON students FOR SELECT TO authenticated
  USING (
    section_id IN (
      SELECT section_id FROM faculty_assignments
      WHERE faculty_id = auth.uid()
    )
  );

-- Audit logs: SELECT for admin only, INSERT via service-role only
CREATE POLICY "audit_logs_admin_select"
  ON audit_logs FOR SELECT TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### 3.2 Service-Role Key Isolation

The Supabase service-role key (which bypasses RLS) is:
- Never exposed to the browser
- Never included in client-side code
- Only used in `src/server/**` modules
- Validated at startup by `src/lib/env.ts`

```typescript
// serviceRole.ts - server-only
export function getSupabaseServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-only
  );
}
```

### 3.3 SQL Injection Prevention

All database queries use the Supabase JavaScript client, which uses parameterized queries internally. No raw SQL string concatenation is used in application code.

### 3.4 Database Trigger Guard

A database-level trigger (`027_team_capacity_trigger.sql`) prevents adding members beyond team capacity, acting as a last-resort guard if the application layer is bypassed.

---

## 4. File Storage Security

### 4.1 Private Buckets

All uploaded files (resumes, PPTs, reports) are stored in a **private** Supabase Storage bucket (`acadex-artefacts`). Files cannot be accessed via direct URL.

### 4.2 Signed URLs

Access to files requires generating a signed URL through the application:

```typescript
// generateSignedUrl() in src/server/storage/index.ts
// Max expiry: 3600 seconds (enforced cap)
// API endpoint: GET /api/submissions/[id]/url → 300 seconds (5 minutes)
```

Before generating a URL, the API route verifies:
- Student must be a member of the team that owns the submission
- Faculty must be assigned to the section containing that team

### 4.3 MIME Type Validation

File uploads are validated server-side before touching Supabase Storage:

```typescript
ALLOWED_MIME_TYPES = {
  resume: ['application/pdf'],
  ppt:    ['application/vnd.openxmlformats-officedocument.presentationml.presentation',
           'application/vnd.ms-powerpoint'],
  report: ['application/pdf'],
}
```

Clients cannot bypass this by setting an arbitrary Content-Type header.

### 4.4 File Size Limits

```
Resume:  20 MB
PPT:    100 MB
Report:  50 MB
```

Enforced server-side before upload is initiated.

### 4.5 Storage Path Structure

Files are stored at structured paths that prevent collisions and aid administration:

```
{academic_year}/{dept_code}/{team_id}/{milestone_id}/{type}/{filename}
```

---

## 5. Input Validation

All API route inputs are validated using Zod schemas before any business logic executes.

```typescript
// Example: proposal submission schema
const schema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50).max(5000),
  sdg_numbers: z.array(z.number().int().min(1).max(17)).min(1)
});
```

Validation failures return a `422` response with per-field error details. The application never processes malformed input.

---

## 6. Transport Security

| Control | Mechanism |
|---------|-----------|
| HTTPS enforcement | Vercel automatically redirects HTTP → HTTPS |
| SSL/TLS certificate | Automatically managed by Vercel |
| HSTS | Provided by Vercel edge |
| Supabase connections | All connections to Supabase use HTTPS |

---

## 7. Environment Security

| Variable | Exposure | Protection |
|----------|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Public (safe — anon RLS enforced) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Public (safe — anon RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Validated at startup; never logged |
| `RESEND_API_KEY` | Server only | Validated at startup; never logged |

Environment variable validation at startup via `src/lib/env.ts`:
```typescript
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
});
// App refuses to start if any variable is missing or invalid
```

---

## 8. Audit Trail

Every sensitive action is permanently recorded in `audit_logs`:

| Action Category | Events Logged |
|----------------|--------------|
| Authentication | login, logout |
| User management | created, edited, deleted, password changed |
| Academic structure | department/year/semester/section create, close, deactivate |
| Faculty | assigned, unassigned |
| Teams | formed, member added, member removed |
| Proposals | submitted, approved, rejected, revision requested |
| Files | uploaded, accessed (every signed URL generation) |
| Milestones | created, deadline updated |
| Submissions | uploaded, overwritten |
| Email failures | notification email failed after all retries |

Each entry captures:
- Actor ID, role, and email (at time of event)
- IP address and User-Agent
- Target table and record ID
- Previous value (JSON) and new value (JSON)
- Timestamp

Audit logs are **immutable** — no UPDATE or DELETE is permitted via RLS. Even admin users can only SELECT.

---

## 9. Email Security

### 9.1 Sender Domain

Production emails are sent from `noreply@acadex.app`. The domain must be verified with Resend to prevent spoofing.

### 9.2 No Sensitive Data in Emails

Email bodies contain only:
- A human-readable notification message
- A deep link back to the platform

Passwords, keys, and personal data are never included in emails.

### 9.3 Retry Queue Security

The email retry queue uses service-role access only. Failed emails are retried up to 4 times with exponential backoff. After exhaustion, the failure is recorded in the audit log. Exhausted entries remain in the table for administrative review.

---

## 10. Known Limitations & Recommendations

| Item | Current State | Recommendation |
|------|--------------|----------------|
| Rate limiter storage | In-memory (single instance) | Migrate to Vercel KV or Redis for multi-instance deploys |
| Signed URL expiry | 5 minutes (submissions), 1 hour max | Current is appropriate; no change needed |
| MFA | Optional for faculty/student, available for admin | Consider enforcing MFA for faculty as well |
| Audit log retention | Indefinite | Define a retention policy (e.g., 7 years) |
| File virus scanning | Not implemented | Add a ClamAV or cloud scanner on file upload in future |
| CSP headers | Not explicitly configured | Add Content-Security-Policy headers via next.config.ts |
| Dependency audits | Not automated | Add `npm audit` to CI pipeline |

---

## 11. Security Test Coverage

| Test Area | Location | Status |
|-----------|----------|--------|
| Proposal FSM invalid transitions | `tests/unit/proposalStateMachine.test.ts` | ✅ |
| Team formation CGPA eligibility | `tests/unit/teamFormation.test.ts` | ✅ |
| Input validation edge cases | `tests/unit/validation.test.ts` | ✅ |
| Unauthorized role access | `tests/security/` | Infrastructure ready |
| RLS policy enforcement | `tests/security/` | Infrastructure ready |
| Rate limit behavior | Manual testing | Verified |

---

*Last Updated: November 2026 | Author: Naren SJ*
