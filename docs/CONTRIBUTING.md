# Contributing to AcadeX

## Pre-Migration Backup Protocol

Every **destructive migration** (DROP COLUMN, DROP TABLE, data transform, bulk UPDATE) requires the following steps before execution in production:

1. **Verify last daily snapshot** is < 24 h old via Supabase Dashboard → Settings → Backups.
2. **Trigger a manual backup checkpoint**:
   ```bash
   gh workflow run db-backup.yml
   ```
   Wait for the GitHub Actions run to complete successfully before continuing.
3. **Apply the migration**:
   ```bash
   supabase db push --linked
   ```
4. **Run the integration test suite** to verify success:
   ```bash
   npx vitest --run tests/integration
   ```
5. **On failure**: restore from PITR immediately (see `docs/recovery-runbook.md`).
6. **Commit a rollback `.sql` file** alongside every destructive forward migration. Name it `<NNN>_rollback_<description>.sql`.

> A migration without a rollback file will be **blocked at code review**.

---

## Migration File Naming

```
supabase/migrations/<NNN>_<snake_case_description>.sql
```

Example: `020_add_attendance_table.sql`

---

## Code Style

- TypeScript strict mode - zero `any` types.
- All API route handlers validate input with Zod before touching the database.
- All mutations write to the audit log (fire-and-forget via `writeAuditLog`).
- Server Components by default; `"use client"` only where interactivity is required.
- `cookies()`, `headers()`, `params`, `searchParams` must always be `await`-ed (Next.js 15).

---

## Branch Strategy

- `main` - production-ready, protected
- `dev` - integration branch
- Feature branches: `feat/<short-description>`
- Bugfix branches: `fix/<short-description>`

Never push directly to `main`. Open a PR and get at least one review.
