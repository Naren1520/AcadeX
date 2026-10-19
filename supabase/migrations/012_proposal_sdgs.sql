-- Migration 012: proposal_sdgs

CREATE TABLE proposal_sdgs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sdg_number   integer NOT NULL CHECK (sdg_number BETWEEN 1 AND 17),
  UNIQUE (proposal_id, sdg_number)
);

CREATE INDEX idx_proposal_sdgs_proposal ON proposal_sdgs(proposal_id);

ALTER TABLE proposal_sdgs ENABLE ROW LEVEL SECURITY;
