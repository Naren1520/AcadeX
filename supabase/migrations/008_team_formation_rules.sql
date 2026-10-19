-- Migration 008: team_formation_rules

CREATE TABLE team_formation_rules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  section_id      uuid NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  cgpa_lower      numeric(4,2) NOT NULL CHECK (cgpa_lower >= 0.00 AND cgpa_lower <= 10.00),
  cgpa_upper      numeric(4,2) NOT NULL CHECK (cgpa_upper >= 0.00 AND cgpa_upper <= 10.00),
  min_team_size   integer NOT NULL CHECK (min_team_size >= 1),
  max_team_size   integer NOT NULL CHECK (max_team_size >= min_team_size),
  max_teams       integer NOT NULL CHECK (max_teams >= 1),
  is_enabled      boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (cgpa_upper >= cgpa_lower)
);

CREATE INDEX idx_tfr_section ON team_formation_rules(section_id);
CREATE INDEX idx_tfr_faculty ON team_formation_rules(faculty_id);

CREATE TRIGGER team_formation_rules_updated_at
  BEFORE UPDATE ON team_formation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE team_formation_rules ENABLE ROW LEVEL SECURITY;
