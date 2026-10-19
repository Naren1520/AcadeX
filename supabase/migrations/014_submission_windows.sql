-- Migration 014: submission_windows

CREATE TABLE submission_windows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
  faculty_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  opens_at     timestamptz NOT NULL,
  closes_at    timestamptz NOT NULL,
  CHECK (closes_at > opens_at),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sw_milestone  ON submission_windows(milestone_id);
CREATE INDEX idx_sw_closes_at  ON submission_windows(closes_at);

ALTER TABLE submission_windows ENABLE ROW LEVEL SECURITY;
