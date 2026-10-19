-- Migration 009: teams

CREATE TABLE teams (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      uuid NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  rule_id         uuid NOT NULL REFERENCES team_formation_rules(id) ON DELETE RESTRICT,
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'forming'
                    CHECK (status IN ('forming', 'confirmed', 'dissolved')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_section ON teams(section_id);
CREATE INDEX idx_teams_rule    ON teams(rule_id);
CREATE INDEX idx_teams_status  ON teams(status);

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
