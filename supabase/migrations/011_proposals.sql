-- Migration 011: proposals

CREATE TABLE proposals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id             uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  faculty_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title               text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description         text NOT NULL,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  parent_proposal_id  uuid REFERENCES proposals(id) ON DELETE SET NULL,
  version             integer NOT NULL DEFAULT 1,
  rejection_reason    text CHECK (rejection_reason IS NULL OR char_length(rejection_reason) >= 10),
  revision_notes      text CHECK (revision_notes IS NULL OR char_length(revision_notes) >= 10),
  reviewed_at         timestamptz,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_team    ON proposals(team_id);
CREATE INDEX idx_proposals_faculty ON proposals(faculty_id);
CREATE INDEX idx_proposals_status  ON proposals(status);

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
