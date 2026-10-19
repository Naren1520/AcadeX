-- Migration 010: team_members

CREATE TABLE team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  student_id  uuid NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  is_lead     boolean NOT NULL DEFAULT false,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, student_id),
  UNIQUE (student_id)   -- a student can only be in one team at a time
);

CREATE INDEX idx_team_members_team    ON team_members(team_id);
CREATE INDEX idx_team_members_student ON team_members(student_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
