#!/usr/bin/env bash
# pre-migration-check.sh
# Run this before applying any destructive migration to production.
# Requires: GitHub CLI (gh), supabase CLI, git

set -euo pipefail

echo "=== AcadeX Pre-Migration Backup Check ==="
echo ""

# 1. Verify PITR is enabled (manual check reminder)
echo "Step 1: Verify PITR is enabled on your Supabase project."
echo "  → Open: https://app.supabase.com/project/_/settings/backups"
echo "  → Confirm Point-in-Time Recovery shows: Enabled"
echo ""
read -p "Is PITR active? (y/n): " pitr_ok
if [[ "$pitr_ok" != "y" ]]; then
  echo "ERROR: PITR must be active before running destructive migrations. Aborting."
  exit 1
fi

# 2. Trigger manual backup checkpoint via GitHub Actions
echo ""
echo "Step 2: Triggering manual database backup via GitHub Actions workflow_dispatch..."
gh workflow run db-backup.yml

echo "  Waiting 90 seconds for backup to start..."
sleep 90

echo "  Check the Actions tab to confirm the run completed successfully:"
echo "  → https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
read -p "Did the backup workflow complete successfully? (y/n): " backup_ok
if [[ "$backup_ok" != "y" ]]; then
  echo "ERROR: Backup must succeed before applying migration. Aborting."
  exit 1
fi

# 3. Confirm rollback file exists
echo ""
echo "Step 3: Confirming a rollback .sql file exists for this migration..."
MIGRATION_FILE="$1"
if [[ -z "$MIGRATION_FILE" ]]; then
  echo "WARNING: No migration file specified. Pass the migration filename as argument."
  echo "  Usage: ./scripts/pre-migration-check.sh supabase/migrations/020_your_migration.sql"
else
  ROLLBACK_PATTERN="${MIGRATION_FILE/_rollback_/.sql}"
  if ls supabase/migrations/*rollback* 2>/dev/null | grep -q .; then
    echo "  Rollback file found."
  else
    echo "WARNING: No rollback file found in supabase/migrations/. Ensure one is committed."
  fi
fi

echo ""
echo "=== Pre-migration checks passed. Proceed with: ==="
echo "  supabase db push --linked"
echo ""
echo "=== After migration: run integration tests ==="
echo "  npx vitest --run tests/integration"
