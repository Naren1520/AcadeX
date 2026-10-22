-- Migration 020: enrich audit_logs with actor email, ip, user_agent
-- Safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS actor_email  text,
  ADD COLUMN IF NOT EXISTS ip_address   text,
  ADD COLUMN IF NOT EXISTS user_agent   text;
