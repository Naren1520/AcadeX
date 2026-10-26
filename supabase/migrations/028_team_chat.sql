-- Migration 028: team group chat

CREATE TABLE team_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  reply_to_id uuid REFERENCES team_messages(id) ON DELETE SET NULL,
  is_deleted  boolean NOT NULL DEFAULT false,
  edited_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tm_team_messages      ON team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_tm_sender    ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_tm_created   ON team_messages(team_id, created_at);

ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Team members + mentor can read messages
CREATE POLICY "tm_read" ON team_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members WHERE team_id = team_messages.team_id AND student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM team_mentors WHERE team_id = team_messages.team_id AND mentor_id = auth.uid()
    )
    OR current_user_role() IN ('faculty', 'admin')
  );

-- Members + mentor can insert
CREATE POLICY "tm_insert" ON team_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM team_members WHERE team_id = team_messages.team_id AND student_id = auth.uid())
      OR EXISTS (SELECT 1 FROM team_mentors WHERE team_id = team_messages.team_id AND mentor_id = auth.uid())
    )
  );

-- Only sender can update (edit/soft-delete)
CREATE POLICY "tm_update_own" ON team_messages
  FOR UPDATE USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Admin full access
CREATE POLICY "tm_admin_all" ON team_messages
  FOR ALL USING (current_user_role() = 'admin');

-- ── Message read receipts ─────────────────────────────────────
CREATE TABLE team_message_reads (
  message_id uuid NOT NULL REFERENCES team_messages(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX idx_tmr_message ON team_message_reads(message_id);
CREATE INDEX idx_tmr_user    ON team_message_reads(user_id);

ALTER TABLE team_message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tmr_own" ON team_message_reads
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "tmr_read_teammates" ON team_message_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_messages tm
      JOIN team_members tmem ON tmem.team_id = tm.team_id
      WHERE tm.id = team_message_reads.message_id
        AND tmem.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM team_messages tm
      JOIN team_mentors tmt ON tmt.team_id = tm.team_id
      WHERE tm.id = team_message_reads.message_id
        AND tmt.mentor_id = auth.uid()
    )
  );
