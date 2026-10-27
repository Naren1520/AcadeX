-- Migration 023: slot-based team formation rules
-- Replaces the single CGPA band per rule with multiple slots per rule.
-- Each slot defines how many members must come from a specific CGPA band.
--
-- Example rule:
--   Rule: "Mixed A" - team_size=4, max_teams=8
--     Slot 1: cgpa_lower=8.5, cgpa_upper=10.0, count=1  (1 member above 8.5)
--     Slot 2: cgpa_lower=6.0, cgpa_upper=8.49, count=3  (3 members 6.0–8.4)
--
-- The old cgpa_lower/cgpa_upper/min_team_size/max_team_size columns are kept
-- for backward compatibility but team_size and slots take precedence when slots exist.

-- Add new columns to existing table
ALTER TABLE team_formation_rules
  ADD COLUMN IF NOT EXISTS label        text NOT NULL DEFAULT 'Rule',
  ADD COLUMN IF NOT EXISTS team_size    integer CHECK (team_size >= 1),
  ADD COLUMN IF NOT EXISTS formed_count integer NOT NULL DEFAULT 0;

-- team_formation_slots - one row per CGPA band within a rule
CREATE TABLE IF NOT EXISTS team_formation_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id     uuid NOT NULL REFERENCES team_formation_rules(id) ON DELETE CASCADE,
  cgpa_lower  numeric(4,2) NOT NULL CHECK (cgpa_lower >= 0 AND cgpa_lower <= 10),
  cgpa_upper  numeric(4,2) NOT NULL CHECK (cgpa_upper >= 0 AND cgpa_upper <= 10),
  count       integer NOT NULL CHECK (count >= 1),
  label       text NOT NULL DEFAULT '',   -- e.g. "High performers", "Mid-range"
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (cgpa_upper >= cgpa_lower)
);

CREATE INDEX IF NOT EXISTS idx_tfs_rule ON team_formation_slots(rule_id);

ALTER TABLE team_formation_slots ENABLE ROW LEVEL SECURITY;

-- Faculty can manage slots for rules they own
CREATE POLICY "tfs_faculty_own" ON team_formation_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_formation_rules tfr
      WHERE tfr.id = team_formation_slots.rule_id
        AND tfr.faculty_id = auth.uid()
    )
  );

-- Students can read slots for rules in their section
CREATE POLICY "tfs_student_select" ON team_formation_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_formation_rules tfr
      JOIN students s ON s.id = auth.uid()
      WHERE tfr.id = team_formation_slots.rule_id
        AND s.section_id = tfr.section_id
    )
  );

CREATE POLICY "tfs_admin_all" ON team_formation_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
