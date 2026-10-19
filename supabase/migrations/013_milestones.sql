-- Migration 013: milestones

CREATE TABLE milestones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  uuid NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  faculty_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description  text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  deadline     timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'completed', 'missed')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_proposal ON milestones(proposal_id);
CREATE INDEX idx_milestones_deadline ON milestones(deadline);

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
