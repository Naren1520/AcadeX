-- Migration 015: submissions

CREATE TABLE submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  milestone_id    uuid NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
  window_id       uuid NOT NULL REFERENCES submission_windows(id) ON DELETE RESTRICT,
  submitted_by    uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  artefact_type   text NOT NULL CHECK (artefact_type IN ('ppt', 'report', 'github_link')),
  storage_path    text,
  github_url      text CHECK (
                    github_url IS NULL OR
                    github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
                  ),
  status          text NOT NULL DEFAULT 'submitted'
                    CHECK (status IN ('submitted', 'accepted', 'missed_deadline')),
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, milestone_id, window_id, artefact_type)
);

CREATE INDEX idx_submissions_team      ON submissions(team_id);
CREATE INDEX idx_submissions_milestone ON submissions(milestone_id);
CREATE INDEX idx_submissions_window    ON submissions(window_id);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
