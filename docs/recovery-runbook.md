# AcadeX - Database Recovery Runbook

> **Last updated:** See git history for this file.
> **Maintain this document** whenever backup configuration changes.

---

## Backup Layers

| Layer | Mechanism | Frequency | Retention |
|-------|-----------|-----------|-----------|
| L1 - Supabase PITR | Write-Ahead Log streaming | Continuous | 7–30 days (plan-dependent) |
| L2 - Supabase Daily Snapshot | Physical volume snapshot | Daily ~03:00 UTC | 7 days (Pro) |
| L3 - Off-Platform pg_dump | GitHub Actions cron | Nightly 02:00 UTC | 90 days (separate cloud bucket) |

---

## Recovery Scenarios

### Scenario 1: Accidental row deletion

**Use L1 (PITR)**

1. Open Supabase Dashboard → **Settings → Backups → Point in Time Recovery**.
2. Select a timestamp _before_ the deletion occurred.
3. Click **Restore** - this creates a new project with the restored data.
4. Update your connection strings and DNS/Vercel env vars to point at the restored project.
5. Verify data integrity by running the integration test suite.

---

### Scenario 2: Bad migration applied

**Use L1 (PITR)**

1. Identify the exact timestamp _before_ the migration was applied (check `audit_logs.created_at` for the migration event or use the GitHub Actions run timestamp).
2. Open Supabase Dashboard → **Settings → Backups → Point in Time Recovery**.
3. Restore to that timestamp.
4. Fix the forward migration SQL.
5. Re-apply with `supabase db push --linked` against the restored project.
6. Run integration tests to confirm success.

---

### Scenario 3: Full Supabase project loss

**Use L3 (off-platform pg_dump)**

1. Download the most recent `.dump.gpg` file from the backup bucket.
2. Decrypt:
   ```bash
   gpg --decrypt acadex_backup_<TIMESTAMP>.dump.gpg > acadex_backup.dump
   ```
3. Create a new Supabase project.
4. Restore the logical dump:
   ```bash
   pg_restore --clean --no-acl --no-owner \
     -d "postgresql://postgres.<PROJECT-REF>:<PASSWORD>@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
     acadex_backup.dump
   ```
5. Re-configure Supabase Auth (JWT secret, email providers, MFA settings).
6. Re-configure Supabase Storage buckets and RLS policies.
7. Update all environment variables in Vercel.
8. Run integration and E2E test suites.

---

### Scenario 4: Storage file corruption

1. Enumerate affected files using the Supabase Storage API or Dashboard.
2. Download corresponding files from the off-platform storage backup (synced nightly alongside the pg_dump).
3. Re-upload affected files via the Supabase Dashboard or Storage API.
4. Re-generate signed URLs as needed - existing signed URLs will have expired.

---

## Pre-Migration Backup Protocol

**Before every destructive migration** (DROP COLUMN, DROP TABLE, data transform):

1. **Verify last L2 snapshot** is recent (< 24 h old) via Supabase Dashboard → Settings → Backups.
2. **Trigger a manual L3 checkpoint**:
   ```bash
   gh workflow run db-backup.yml
   ```
   Wait for the run to complete successfully.
3. **Apply the migration**:
   ```bash
   supabase db push --linked
   ```
4. **Verify success** by running the integration test suite:
   ```bash
   npx vitest --run tests/integration
   ```
5. **If the migration fails**: restore from PITR to the timestamp immediately before step 3.
6. Commit a rollback `.sql` file alongside every destructive forward migration.

---

## Verifying Backup Health (Monthly Checklist)

- [ ] PITR is active on Supabase Dashboard (Settings → Backups shows "Enabled")
- [ ] PITR retention window is ≥ 7 days
- [ ] Latest L3 `.dump.gpg` file exists in the backup bucket with a timestamp < 25 h ago
- [ ] Decrypt and `pg_restore --list` the latest dump to a local/dev Postgres to confirm validity
- [ ] GitHub Actions `db-backup` workflow last run shows green

---

## Key Contacts & Secrets

| Item | Location |
|------|----------|
| `PROD_DATABASE_URL` | GitHub Actions secret (never commit) |
| `BACKUP_BUCKET_URL` | GitHub Actions secret |
| `GPG_KEY_ID` | GitHub Actions secret |
| GPG private key (decryption) | Hardware key / secure vault (separate from codebase) |
| Supabase service role key | Vercel environment variables |
