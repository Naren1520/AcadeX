# AcadeX – Technical Documentation

## 1. Architecture Overview

AcadeX follows a **server-centric layered architecture** built on Next.js 16 App Router. Each layer has a single responsibility, and data only flows downward.

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER  (React 19 / Next.js App Router)            │
│  ┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │  Admin Portal  │ │  Faculty Portal  │ │  Student Portal  │  │
│  │  /admin/**     │ │  /faculty/**     │ │  /student/**     │  │
│  └────────────────┘ └──────────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ROUTE LAYER  (Next.js API Routes – /api/**)                    │
│  Authentication · Authorization checks · Input validation       │
├─────────────────────────────────────────────────────────────────┤
│  SERVICE LAYER  (src/server/**)                                  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Audit Logger│ │ Notification │ │ Storage  │ │ Workflow  │ │
│  │             │ │   Engine     │ │ Manager  │ │ Engines   │ │
│  └─────────────┘ └──────────────┘ └──────────┘ └───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                      │
│  PostgreSQL 15+ (Supabase)  │  Supabase Storage  │  Resend API │
└─────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Browser Request
  → Next.js Edge Middleware (session validation, role-based redirect)
  → Server Component (SSR data fetch via Supabase server client)
  → Client Component hydration
  → User action triggers API Route (POST/PATCH/DELETE)
  → API Route: auth check → role check → Zod validation → business logic
  → Service layer (audit log, notifications, storage)
  → Supabase PostgreSQL (RLS enforced at DB level)
  → Response JSON → Client state update
```

---

## 2. Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Authentication routes (login, MFA, forgot-password)
│   ├── (portal)/            # Authenticated portal routes
│   │   ├── layout.tsx       # Portal shell (sidebar, header, navigation)
│   │   ├── admin/           # Admin-only pages
│   │   ├── faculty/         # Faculty-only pages
│   │   └── student/         # Student-only pages
│   ├── (public)/            # Public pages (landing, about, academics)
│   └── api/                 # API route handlers
│       ├── admin/           # Admin API endpoints
│       ├── auth/            # Auth endpoints (login, logout, MFA, session)
│       ├── cron/            # Scheduled job endpoints
│       ├── proposals/       # Proposal CRUD + workflow
│       ├── submissions/     # Submission upload + signed URL
│       ├── teams/           # Team formation + membership
│       └── ...
│
├── components/              # Shared UI components
│   ├── feedback/            # ErrorBoundary, Skeleton, EmptyState
│   ├── forms/               # FormField, FormError, SubmitButton
│   ├── guide/               # GuideShell, VerticalTimeline, etc.
│   ├── layout/              # Shell, Sidebar, Header, NavigationProgress
│   ├── tables/              # DataTable with sorting/pagination
│   └── ui/                  # Badge, Button, Card, Dialog, Icon, Input, etc.
│
├── config/                  # App configuration (navigation menus)
│
├── features/                # Domain feature modules (each has types/schemas/services)
│   ├── academic-structure/  # Departments, years, semesters, sections
│   ├── approvals/           # Proposal approval workflows
│   ├── audit-logs/          # Audit log viewing
│   ├── identity/            # User profiles and auth
│   ├── notifications/       # In-app notification feed
│   ├── project-management/  # Milestones and project tracking
│   ├── submissions/         # File submission management
│   ├── team-formation/      # Team rules and formation
│   └── users/               # User management
│
├── hooks/                   # Custom React hooks
│
├── lib/                     # Shared utilities
│   ├── constants/           # SDGs list, storage config
│   ├── dates/               # Date formatting helpers
│   ├── errors/              # Typed HTTP error classes
│   ├── supabase/            # Supabase client factories
│   ├── validation/          # Shared Zod schemas
│   ├── env.ts               # Environment variable validation
│   └── rateLimit.ts         # In-memory rate limiter
│
├── server/                  # Server-only service modules
│   ├── audit/               # Audit log writer
│   ├── authorization/       # Role and assignment guards
│   ├── notifications/       # Email + in-app notification sender
│   ├── storage/             # Artefact upload and signed URL generation
│   └── workflows/           # Proposal FSM, team formation engine
│
├── styles/                  # Global CSS
└── types/                   # TypeScript type definitions (database.ts)
```

---

## 3. Authentication & Session Management

### Session Flow

```
User submits email/password
  → POST /api/auth/login
  → Rate limit check (10 req / 60 s per IP; 5-min block on exceed)
  → supabase.auth.signInWithPassword()
  → If MFA enrolled → 302 to /mfa
  → supabase.auth.verifyTotp() on /api/auth/mfa/verify
  → Set HttpOnly session cookie via @supabase/ssr
  → Server Component reads session via createServerClient()
```

### Supabase Client Factories (`src/lib/supabase/`)

| File | Purpose |
|------|---------|
| `client.ts` | Browser-side client (uses anon key, subject to RLS) |
| `server.ts` | Server Component client (reads cookies, subject to RLS) |
| `serviceRole.ts` | Service-role client (bypasses RLS – used only in `src/server/`) |
| `helpers.ts` | `requirePageRole()` – redirects if role doesn't match |
| `typed.ts` | Type-safe wrapper returning `SupabaseClient<Database>` |

### Rate Limiting

```
Window   : 60 seconds
Limit    : 10 attempts per IP
Block    : 5 minutes after limit exceeded
Storage  : In-memory Map (single-instance; replace with Redis for multi-instance)
```

### MFA

Multi-Factor Authentication is enforced server-side via Supabase Auth TOTP. The `/mfa` page calls `POST /api/auth/mfa/verify`. Sessions without MFA verification are redirected away from admin pages.

---

## 4. Authorization Model

### Role Hierarchy

```
admin
  └─ Full platform access
  └─ Can manage departments, years, semesters, sections, users
  └─ Views all audit logs

faculty
  └─ Limited to assigned sections only
  └─ Manages team formation rules, proposals, milestones, submission windows
  └─ Views mentee teams and submissions

student
  └─ Limited to own section and own team
  └─ Can form/join teams, submit proposals, upload artefacts
```

### Authorization Guards (src/server/authorization/index.ts)

```typescript
// Checks role from profiles table; throws 401/403
getAuthenticatedUserWithRole(supabase)

// Throws 403 if role not in allowed list
requireRole(supabase, ['faculty', 'admin'])

// Throws 403 if faculty has no assignment to that section/dept
requireFacultyAssignment(supabase, facultyId, { sectionId })

// Throws 403 unless userId === resourceOwnerId or user is admin
requireOwnerOrAdmin(supabase, userId, resourceOwnerId)
```

### Database Row-Level Security

Every table has RLS policies in `019_rls_policies.sql`. Examples:

- `students`: students can only SELECT their own row; faculty can SELECT/UPDATE rows in their sections; admin can do anything
- `proposals`: teams can INSERT proposals for their own team; faculty can UPDATE proposals for their sections; students can only SELECT their team's proposals
- `audit_logs`: INSERT via service-role only; SELECT for admin only
- `submissions`: INSERT/SELECT restricted to team members and assigned faculty

---

## 5. Database Schema

### Entity Relationship Summary

```
departments (1) ──────────────────────── (∞) sections
academic_years (1) ─── (∞) semesters ─── (∞) sections
profiles (1) ─── (1) students
profiles (1) ─── (∞) faculty_assignments ─── (1) sections

sections (1) ─── (∞) team_formation_rules
team_formation_rules (1) ─── (∞) team_formation_slots
team_formation_rules (1) ─── (∞) teams
teams (1) ─── (∞) team_members ─── (1) students
teams (1) ─── (∞) proposals
proposals (∞) ─── (∞) proposal_sdgs
proposals (1) ─── (∞) milestones
milestones (1) ─── (∞) submission_windows
submission_windows (1) ─── (∞) submissions
```

### All Tables

| # | Table | Key Columns | Notes |
|---|-------|-------------|-------|
| 1 | `profiles` | `id`, `role`, `full_name`, `email` | Mirrors Supabase Auth `auth.users` |
| 2 | `departments` | `id`, `name`, `code`, `is_active` | CSE, ISE, ME, etc. |
| 3 | `academic_years` | `id`, `label`, `is_closed` | e.g. "2024-25" |
| 4 | `semesters` | `id`, `academic_year_id`, `label`, `is_closed` | Sem 1–8 |
| 5 | `sections` | `id`, `semester_id`, `department_id`, `label` | A, B, C sections |
| 6 | `faculty_assignments` | `faculty_id`, `section_id`, `department_id` | Many-to-many |
| 7 | `students` | `id`, `usn`, `department_id`, `section_id`, `cgpa`, `skills[]` | Extends profiles |
| 8 | `team_formation_rules` | `faculty_id`, `section_id`, `max_teams`, `team_size`, `is_enabled` | Per-section rules |
| 9 | `team_formation_slots` | `rule_id`, `cgpa_lower`, `cgpa_upper`, `count`, `label` | CGPA band quotas |
| 10 | `teams` | `section_id`, `rule_id`, `name`, `status` | forming/confirmed/dissolved |
| 11 | `team_members` | `team_id`, `student_id`, `is_lead` | Unique per student |
| 12 | `team_invitations` | `team_id`, `invitee_id`, `status` | pending/accepted/rejected |
| 13 | `team_mentors` | `team_id`, `faculty_id`, `assigned_by` | Mentor assignments |
| 14 | `team_chat` | `team_id`, `sender_id`, `message` | Team communication |
| 15 | `proposals` | `team_id`, `faculty_id`, `title`, `status`, `version` | FSM-controlled |
| 16 | `proposal_sdgs` | `proposal_id`, `sdg_number` | 1–17 |
| 17 | `milestones` | `proposal_id`, `name`, `deadline`, `status` | open/completed/missed |
| 18 | `submission_windows` | `milestone_id`, `opens_at`, `closes_at` | Time-bound periods |
| 19 | `submissions` | `team_id`, `window_id`, `artefact_type`, `storage_path`, `github_url` | ppt/report/github_link |
| 20 | `notifications` | `recipient_id`, `message`, `deep_link`, `is_read` | In-app feed |
| 21 | `audit_logs` | `actor_id`, `actor_role`, `action_type`, `previous_value`, `new_value` | Immutable |
| 22 | `email_retry_queue` | `recipient_email`, `attempt_count`, `next_attempt_at`, `exhausted` | Retry up to 4× |

### Migration Order

```
001_profiles.sql          → User profiles table
002_departments.sql       → Departments
003_academic_years.sql    → Academic year periods
004_semesters.sql         → Semesters (FK → academic_years)
005_sections.sql          → Sections (FK → semesters + departments)
006_faculty_assignments.sql → Faculty–section mapping
007_students.sql          → Student records (FK → profiles)
008_team_formation_rules.sql → Team rules per section
009_teams.sql             → Teams
010_team_members.sql      → Team membership
011_proposals.sql         → Project proposals
012_proposal_sdgs.sql     → SDG mappings
013_milestones.sql        → Milestones
014_submission_windows.sql → Submission windows
015_submissions.sql       → Submissions + storage paths
016_notifications.sql     → Notification records
017_audit_logs.sql        → Audit log table
018_email_retry_queue.sql → Email retry queue
019_rls_policies.sql      → Row-Level Security policies
020_audit_logs_enrich.sql → Added actor_email, ip_address, user_agent
021_faculty_can_manage_students.sql → Faculty CRUD on student records
022_onboarding.sql        → Bulk student onboarding
023_team_formation_slots.sql → CGPA slot system
024_team_invitations.sql  → Invitation system
025_team_mentors.sql      → Faculty mentor assignments
026_missing_rls_policies.sql → Additional RLS coverage
027_team_capacity_trigger.sql → DB trigger for team capacity
028_team_chat.sql         → Team chat messages
```

---

## 6. API Routes Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Sign in with email + password | Public |
| POST | `/api/auth/logout` | Invalidate session | Any |
| POST | `/api/auth/mfa/verify` | Verify TOTP code | Any |
| GET | `/api/auth/session` | Get current session info | Any |
| GET | `/api/auth/callback` | OAuth callback handler | Public |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/departments` | List / create departments |
| GET/PATCH/DELETE | `/api/admin/departments/[id]` | Read / update / delete dept |
| GET/POST | `/api/admin/academic-years` | List / create academic years |
| POST | `/api/admin/academic-years/[id]/close` | Close an academic year |
| GET/POST | `/api/admin/semesters` | List / create semesters |
| POST | `/api/admin/semesters/[id]/close` | Close a semester |
| GET/POST | `/api/admin/sections` | List / create sections |
| GET/POST | `/api/admin/faculty-assignments` | List / assign faculty |
| DELETE | `/api/admin/faculty-assignments/[id]` | Remove assignment |
| GET | `/api/admin/audit-logs` | Paginated audit log viewer |

### Proposal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/proposals` | List team proposals / submit new |
| POST | `/api/proposals/[id]/approve` | Faculty: approve proposal |
| POST | `/api/proposals/[id]/reject` | Faculty: reject with reason |
| POST | `/api/proposals/[id]/request-revision` | Faculty: request changes |
| POST | `/api/proposals/[id]/resubmit` | Student: resubmit after revision |

### Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/teams` | List / create teams |
| POST | `/api/teams/[id]/join` | Join a team |
| DELETE | `/api/teams/[id]/members/[studentId]` | Remove a team member |

### Submission Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions/ppt` | Upload PPT file |
| POST | `/api/submissions/report` | Upload PDF report |
| POST | `/api/submissions/github` | Submit GitHub URL |
| GET | `/api/submissions/[id]/url` | Get signed URL for a submission |

### Student Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/students/[id]/cgpa` | Update own CGPA |
| PATCH | `/api/students/[id]/github` | Update GitHub URL |
| PATCH | `/api/students/[id]/skills` | Update skills list |
| POST | `/api/students/[id]/resume` | Upload resume PDF |
| GET | `/api/students/[id]/resume/url` | Get signed URL for resume |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/milestones` | List / create milestones |
| PATCH/DELETE | `/api/milestones/[id]` | Update / delete milestone |
| GET/POST | `/api/submission-windows` | List / create windows |
| GET | `/api/notifications` | Get user's notifications |
| POST | `/api/notifications/[id]/read` | Mark notification as read |
| GET | `/api/team-formation/rules` | Get formation rules |
| POST | `/api/team-formation/rules` | Create new rule |
| DELETE | `/api/team-formation/rules/[id]` | Delete rule |
| POST | `/api/cron/deadline-reminders` | Cron job: send deadline alerts |

---

## 7. Business Logic – Core Workflows

### 7.1 Proposal State Machine

The proposal lifecycle is a strict Finite State Machine:

```
         ┌───────────────────────────┐
         │          pending          │◄──┐
         └──────┬──────┬──────┬─────┘   │
                │      │      │         │
                ▼      ▼      ▼         │
           approved  rejected revision  │
                             _requested─┘
                             (re-submit
                              returns to
                              pending)
```

Valid transitions:
- `pending → approved` ✅
- `pending → rejected` ✅
- `pending → revision_requested` ✅
- `revision_requested → pending` ✅ (student resubmits)
- `approved → *` ❌ (terminal)
- `rejected → *` ❌ (terminal)

Enforced by: `applyProposalTransition()` in `src/server/workflows/proposalStateMachine.ts`

**Single Active Proposal Rule**: A team can only have one proposal in `pending` or `revision_requested` state at any time. Checked via `checkSingleActiveProposal()`.

### 7.2 Team Formation Engine

The engine uses slot-based CGPA band validation:

```
Faculty creates Rule:
  → Label + team_size + max_teams
  → Slots: [ { cgpa_lower, cgpa_upper, count, label }, ... ]
  → Slot counts must sum to team_size

Student forms team:
  → Check student CGPA matches at least one slot
  → Check rule has not exceeded max_teams quota
  → Create team with status "forming"
  → Creator becomes team lead

Student joins team:
  → Check team is not full
  → Check student CGPA fills a remaining unsatisfied slot
  → Add member
  → Recalculate slot satisfaction
  → If all slots satisfied → status = "confirmed", increment formed_count
```

Pure helper functions (testable without DB):
- `findMatchingSlot(cgpa, slots)` – returns matched slot or null
- `checkEligibility(cgpa, rules)` – checks if student is eligible under any rule
- `validateSlots(teamSize, slots)` – ensures slot counts add up to team size
- `validateRuleBands(lower, upper)` – legacy band validation

### 7.3 Email Retry Queue

```
Email send attempt 1 fails
  → Insert into email_retry_queue (attempt_count = 1, next_attempt_at = now + 30s)

Cron job picks up pending records:
  → attempt 2: delay 30s
  → attempt 3: delay 60s
  → attempt 4: delay 120s

After attempt 4 fails:
  → Mark exhausted = true
  → Write NOTIFICATION_EMAIL_FAILED audit log entry
  → No further retries
```

### 7.4 File Storage

```
Upload request arrives at API route
  → validateFileUpload(mimeType, sizeBytes, category)
  → Allowed MIME types:
     resume: application/pdf (max 20 MB)
     ppt:    .pptx / .ppt    (max 100 MB)
     report: application/pdf  (max 50 MB)
  → uploadArtefact() calls Supabase Storage (upsert: true)
  → Writes FILE_UPLOADED audit log
  → Returns storagePath

File access:
  → GET /api/submissions/[id]/url
  → Verify requester is team member or assigned faculty
  → generateSignedUrl(storagePath, actorId, actorRole, 300) → 5-min signed URL
  → Writes FILE_ACCESSED audit log
```

---

## 8. Component Architecture

### Shared UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Shell` | `components/layout/Shell.tsx` | Main layout wrapper (header + sidebar + content) |
| `Sidebar` | `components/layout/Sidebar.tsx` | Role-aware collapsible navigation |
| `Header` | `components/layout/Header.tsx` | Top bar with user info + notifications |
| `NavigationProgress` | `components/layout/NavigationProgress.tsx` | Top loading bar on route transitions |
| `NetworkStatus` | `components/layout/NetworkStatus.tsx` | Offline/slow connection banner |
| `PageWrapper` | `components/layout/PageWrapper.tsx` | Page padding and title wrapper |
| `DataTable` | `components/tables/DataTable.tsx` | Sortable, paginated table |
| `EmptyState` | `components/feedback/Skeleton.tsx` | Consistent empty state display |
| `ErrorBoundary` | `components/feedback/ErrorBoundary.tsx` | Catch and display React errors |
| `Badge` | `components/ui/Badge.tsx` | Status labels (Approved, Pending, etc.) |
| `Button` | `components/ui/Button.tsx` | Themed action buttons |
| `Card` | `components/ui/Card.tsx` | Content card container |
| `Dialog` | `components/ui/Dialog.tsx` | Modal dialog (Radix UI) |
| `Input` | `components/ui/Input.tsx` | Form text input |
| `Select` | `components/ui/Select.tsx` | Dropdown select (Radix UI) |
| `Pagination` | `components/ui/Pagination.tsx` | Table pagination controls |

### Guide Components (`src/components/guide/GuideComponents.tsx`)

| Component | Description |
|-----------|-------------|
| `GuideShell` | Page wrapper with sidebar table-of-contents navigation |
| `VerticalTimeline` | Step-by-step timeline with icons and status |
| `HierarchyTree` | Visual tree for org/hierarchy structure |
| `PermissionMatrix` | Role × feature capability table |
| `LabelledFlow` | Horizontal flow diagram with arrows |
| `StepList` | Numbered step list with descriptions |
| `InfoBox` | Highlighted info/warning/tip box |
| `RuleTable` | Table of system rules and constraints |
| `StatusPill` | Coloured status indicator |
| `FlowDiagram` | Multi-stage process flow |

---

## 9. Navigation & Routing

### Route Groups

```
/                   → Public landing page
/about              → About page
/academics          → Academics overview

/login              → Email/password login
/mfa                → TOTP verification
/forgot-password    → Password reset request

/admin              → Admin dashboard (requires admin role)
/admin/departments  → Department management
/admin/academic-years → Academic year lifecycle
/admin/semesters    → Semester management
/admin/sections     → Section management
/admin/faculty-assignments → Faculty assignment
/admin/students     → Student management + onboarding
/admin/users        → User list
/admin/audit-logs   → Audit log viewer
/admin/notifications → Admin notifications
/admin/guide        → Admin user guide

/faculty            → Faculty dashboard
/faculty/sections   → Assigned sections
/faculty/sections/[sectionId] → Section dashboard (tabs: Students, Teams, Proposals, Milestones, Submissions, Windows)
/faculty/team-formation → Team formation rules
/faculty/proposals  → Proposal review queue
/faculty/milestones → Milestone management
/faculty/submission-windows → Window management
/faculty/mentee/[teamId] → Mentee team dashboard
/faculty/students   → Student list
/faculty/notifications → Faculty notifications
/faculty/guide      → Faculty user guide

/student            → Student dashboard
/student/teams      → Team management
/student/teams/[teamId] → Team detail (members, chat, proposals)
/student/proposals  → Proposal management
/student/milestones → Milestone timeline
/student/submissions → File submissions
/student/profile    → Student profile
/student/notifications → Notification feed
/student/guide      → Student user guide
```

### Loading States

Every route has a corresponding `loading.tsx` that renders a skeleton UI while the server component fetches data. This eliminates white flash on slow navigations.

---

## 10. Error Handling

### Typed HTTP Error Classes (`src/lib/errors/index.ts`)

| Class | HTTP Code | Usage |
|-------|-----------|-------|
| `AuthError` | 401 | Unauthenticated request |
| `ForbiddenError` | 403 | Missing role or assignment |
| `NotFoundError` | 404 | Resource does not exist |
| `ConflictError` | 409 | Duplicate or state conflict |
| `ValidationError` | 422 | Schema/field validation failure (includes per-field errors) |

API routes catch these and return structured JSON:

```json
{
  "error": "Your CGPA does not match any required band.",
  "fields": { "cgpa": "Must be between 7.0 and 10.0" }
}
```

### Client-Side Error Handling

- All `fetch()` calls check both `res.ok` and parse error JSON
- Failed fetch calls display inline error messages (not silent failures)
- `ErrorBoundary` component wraps major sections as a last-resort catch
- Loading, error, and empty states are defined for every data-dependent component

---

## 11. Environment Configuration

Validated at startup by `src/lib/env.ts` using Zod. App will not start if any variable is missing or malformed.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL string | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | ✅ | Supabase public anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | string | ✅ | Service-role key (server-only, bypasses RLS) |
| `RESEND_API_KEY` | string | ✅ | Resend transactional email API key |
| `NEXT_PUBLIC_APP_URL` | string | Optional | Base URL for email deep links |

---

## 12. Testing Infrastructure

### Unit Tests (`vitest`)

Location: `tests/unit/`

| File | Tests |
|------|-------|
| `proposalStateMachine.test.ts` | FSM transitions, single-proposal constraint, deadline validation |
| `teamFormation.test.ts` | CGPA eligibility, slot validation, band checks |
| `validation.test.ts` | Zod schema edge cases |

Run: `npx vitest run`

### E2E Tests (`playwright`)

Location: `tests/e2e/`

Covers: login flow, MFA, team creation, proposal submission, file upload, role-based redirects.

Run: `npx playwright test`

### Security Tests

Location: `tests/security/`

Covers: RLS policy enforcement, unauthorized access attempts, rate limit behavior.

---

## 13. CI/CD Pipeline

### GitHub Actions (`.github/workflows/db-backup.yml`)

Scheduled database backup workflow that snapshots the Supabase PostgreSQL database on a cron schedule.

### Deployment (Vercel)

- **Build**: `next build` (TypeScript type-check included)
- **Environment**: Variables set in Vercel project settings
- **Preview deployments**: Auto-generated for every PR
- **Production**: Merged to `main` triggers automatic deploy

### Pre-deployment Checklist (`scripts/pre-migration-check.sh`)

Shell script that validates database migration state before running new migrations:
- Checks applied vs pending migrations
- Validates migration file naming convention
- Guards against out-of-order migration runs

---

## 14. Performance Considerations

| Area | Strategy |
|------|---------|
| Initial page load | Server-side rendering via Next.js App Router |
| Data fetching | Parallel `Promise.all()` for independent queries in Server Components |
| Navigation | `useTransition` + `router.push()` prevents full unmount; loading skeleton shows immediately |
| Images | Next.js `<Image>` with automatic optimization |
| Fonts | No external font requests on critical path |
| Bundle | Tree-shaking via ESM imports; dynamic import for Recharts charts |
| File access | Signed URLs with short expiry (5 min) prevent CDN caching overhead |
| Email | Async retry queue prevents blocking API responses |
| Rate limiting | IP-based in-memory limiter protects auth routes from brute force |

---

## 15. Security Checklist

| Check | Status |
|-------|--------|
| Row-Level Security on all tables | ✅ |
| Service-role key never sent to browser | ✅ |
| Session validated on every server request | ✅ |
| Rate limiting on login endpoint | ✅ |
| MFA available for admin | ✅ |
| File MIME type validation before upload | ✅ |
| File size limits enforced server-side | ✅ |
| Signed URLs with expiry for file access | ✅ |
| Input validation via Zod on all API routes | ✅ |
| Audit trail for all sensitive operations | ✅ |
| SQL injection prevention (parameterized queries via Supabase client) | ✅ |
| HTTPS enforced by Vercel | ✅ |

---

*Last Updated: November 2026 | Author: Naren SJ*
