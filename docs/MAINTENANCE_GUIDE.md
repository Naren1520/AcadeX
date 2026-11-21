# AcadeX – Maintenance Guide

## Routine Operations

### Database Migrations

Apply new migrations using the Supabase CLI:

```bash
# Check which migrations are pending
npx supabase migration list

# Apply all pending migrations
npx supabase db push --linked

# Always run the check script first
bash scripts/pre-migration-check.sh
```

**Migration naming convention**: `NNN_description.sql` (e.g., `029_new_feature.sql`)

---

### Clearing the Email Retry Queue

Exhausted (failed) emails accumulate in `email_retry_queue`. Periodically clean them up:

```sql
-- View exhausted emails
SELECT * FROM email_retry_queue WHERE exhausted = true ORDER BY created_at DESC;

-- Clean up old exhausted entries (older than 30 days)
DELETE FROM email_retry_queue
WHERE exhausted = true
  AND created_at < now() - interval '30 days';
```

---

### Monitoring Audit Logs

```sql
-- Recent activity in the last 24 hours
SELECT actor_email, action_type, target_table, created_at
FROM audit_logs
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC
LIMIT 100;

-- Failed email notifications
SELECT * FROM audit_logs
WHERE action_type = 'notification.email_failed'
ORDER BY created_at DESC;

-- Actions by a specific user
SELECT action_type, target_table, new_value, created_at
FROM audit_logs
WHERE actor_id = '<user-uuid>'
ORDER BY created_at DESC;
```

---

### Storage Bucket Maintenance

```sql
-- List all files in storage (Supabase dashboard or via API)
-- Check for orphaned files (submissions deleted but files remain)

-- Find submissions with storage paths that no longer exist
-- Run via Supabase SQL editor
SELECT s.id, s.storage_path
FROM submissions s
WHERE s.storage_path IS NOT NULL
  AND s.storage_path NOT IN (
    SELECT name FROM storage.objects WHERE bucket_id = 'acadex-artefacts'
  );
```

---

### Database Backup

Manual backup:
```bash
npx supabase db dump --file backup-$(date +%Y%m%d).sql --linked
```

Automated backup runs via GitHub Actions (`.github/workflows/db-backup.yml`).

---

## User Management

### Creating an Admin User

1. Create user in Supabase Auth (Dashboard → Authentication → Users → Invite)
2. Set their role manually:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'newadmin@college.edu';
```

### Resetting a User Password

Via Supabase Dashboard → Authentication → Users → find user → Send reset email.

Or via Supabase Auth API:
```bash
curl -X POST 'https://<project>.supabase.co/auth/v1/recover' \
  -H 'apikey: <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@college.edu"}'
```

### Deactivating a User

Supabase Auth doesn't have a "disable" flag in the free tier. Workarounds:
1. Delete the user from Auth (they can no longer log in)
2. Or, change their role to a restricted role and use RLS to block access

---

## Monitoring & Alerting

### Vercel Function Logs

View API route logs in Vercel Dashboard → Functions tab. Filter by route or time window to debug errors.

### Supabase Logs

Supabase Dashboard → Logs → API, Database, Auth, Storage logs are all available.

### Error Patterns to Watch

| Log Pattern | Meaning | Action |
|-------------|---------|--------|
| `[AuditLog] INSERT failed` | Audit log write failed | Check service-role key; check DB connection |
| `[Notifications] Email delivery failed` | Resend send failed | Check RESEND_API_KEY; check domain verification |
| `Storage upload failed` | Supabase Storage error | Check bucket exists; check storage policies |
| `Missing or invalid environment variables` | Startup failure | Check all env vars are set in Vercel |

---

## Upgrading Dependencies

### Upgrading Next.js

```bash
# Check latest version
npm show next version

# Upgrade
npm install next@latest

# Type check and build after upgrade
npm run typecheck
npm run build
```

### Upgrading Supabase Client

```bash
npm install @supabase/supabase-js@latest @supabase/ssr@latest

# Regenerate TypeScript types if schema changed
npx supabase gen types typescript --linked > src/types/database.ts
```

### Security Patches

Run regular security audits:
```bash
npm audit
npm audit fix
```

For breaking security fixes:
```bash
npm audit fix --force
# Then run full test suite to verify nothing broke
npx vitest run
npm run build
```

---

## Scaling Considerations

### Rate Limiter

The current in-memory rate limiter (`src/lib/rateLimit.ts`) works for single-instance deployments. For multi-instance (auto-scaling on Vercel):

Replace the in-memory Map with Vercel KV:

```typescript
import { kv } from '@vercel/kv';

export async function checkRateLimit(ip: string) {
  const key = `rate_limit:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, 60);
  if (count > 10) return { allowed: false, retryAfterSeconds: 300 };
  return { allowed: true };
}
```

### Database Connection Pooling

For high traffic, enable Supabase's built-in PgBouncer connection pooling:
- Supabase Dashboard → Database → Connection Pooling → Enable
- Update connection string in environment variables

---

## Recovery Procedures

See `docs/recovery-runbook.md` for detailed disaster recovery procedures including:
- Full database restore from backup
- Storage bucket recovery
- User session invalidation
- Rolling back a failed migration

---

## Documentation Updates

When adding new features, update the following documents:

| Document | When to Update |
|----------|---------------|
| `API_DOCUMENTATION.md` | New or changed API endpoints |
| `DATABASE_SCHEMA.md` | New migrations or schema changes |
| `USER_GUIDE.md` | New user-facing features |
| `SECURITY_REPORT.md` | New security controls or vulnerabilities found |
| `TECHNICAL_DOCUMENTATION.md` | Architectural changes |

---

*Last Updated: November 2026 | Author: Naren SJ*
