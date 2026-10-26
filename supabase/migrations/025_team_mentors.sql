-- Migration 025: project mentor assignment per team

CREATE TABLE team_mentors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  mentor_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,   -- faculty
  assigned_by   uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,   -- faculty (section owner)
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  notes         text,
  UNIQUE (team_id, mentor_id)
);

CREATE INDEX idx_tm_team   ON team_mentors(team_id);
CREATE INDEX idx_tm_mentor ON team_mentors(mentor_id);

ALTER TABLE team_mentors ENABLE ROW LEVEL SECURITY;

-- Mentor can see their own assignments
CREATE POLICY "tm_mentor_select" ON team_mentors
  FOR SELECT USING (mentor_id = auth.uid());

-- Section faculty (assigned_by) can manage
CREATE POLICY "tm_assignee_all" ON team_mentors
  FOR ALL USING (assigned_by = auth.uid());

-- Admin full access
CREATE POLICY "tm_admin_all" ON team_mentors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
