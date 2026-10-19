-- Migration 017: audit_logs
-- Append-only table — no UPDATE or DELETE allowed via RLS

CREATE TABLE audit_logs (
  event_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  actor_role        text NOT NULL CHECK (actor_role IN ('admin', 'faculty', 'student', 'system')),
  action_type       text NOT NULL,
  target_table      text NOT NULL,
  target_record_id  uuid NOT NULL,
  previous_value    jsonb,
  new_value         jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor   ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action  ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target  ON audit_logs(target_table, target_record_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- INSERT only — all roles including admin can insert via service-role client
-- No SELECT/UPDATE/DELETE policies for non-admin sessions
CREATE POLICY "audit_logs_insert_only" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Admin can SELECT audit logs (app layer enforces this; RLS allows it)
CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
-- No UPDATE policy — no one can update audit logs
-- No DELETE policy — no one can delete audit logs
