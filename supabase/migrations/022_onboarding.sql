-- Migration 022: student self-onboarding invitations

-- ── Invitations created by faculty 
CREATE TABLE onboarding_invitations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section_id      uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  department_id   uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  passcode_hash   text NOT NULL,           -- bcrypt hash of the passcode
  label           text NOT NULL DEFAULT '',
  opens_at        timestamptz NOT NULL,
  closes_at       timestamptz NOT NULL,
  max_uses        integer NOT NULL DEFAULT 100,
  use_count       integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (closes_at > opens_at),
  CHECK (max_uses >= 1)
);

CREATE INDEX idx_oi_faculty   ON onboarding_invitations(faculty_id);
CREATE INDEX idx_oi_section   ON onboarding_invitations(section_id);
CREATE INDEX idx_oi_closes_at ON onboarding_invitations(closes_at);

ALTER TABLE onboarding_invitations ENABLE ROW LEVEL SECURITY;

-- Faculty can manage their own invitations
CREATE POLICY "oi_faculty_own" ON onboarding_invitations
  FOR ALL USING (faculty_id = auth.uid());

-- ── Student submissions (pending approval) 
CREATE TABLE onboarding_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   uuid NOT NULL REFERENCES onboarding_invitations(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  email           text NOT NULL,
  password_hash   text NOT NULL,           -- bcrypt hash of student-chosen password
  usn             text NOT NULL CHECK (usn ~ '^[A-Za-z0-9]{10}$'),
  cgpa            numeric(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  github_url      text CHECK (github_url IS NULL OR github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+$'),
  skills          text[] NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_note  text,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  created_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_os_invitation ON onboarding_submissions(invitation_id);
CREATE INDEX idx_os_status     ON onboarding_submissions(status);
CREATE INDEX idx_os_email      ON onboarding_submissions(email);

ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Faculty can see/manage submissions for their invitations
CREATE POLICY "os_faculty_own" ON onboarding_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM onboarding_invitations oi
      WHERE oi.id = onboarding_submissions.invitation_id
        AND oi.faculty_id = auth.uid()
    )
  );

-- ── Attempt tracking for rate limiting 
-- One row per (invitation_id, ip_address), reset every hour
CREATE TABLE onboarding_attempts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid NOT NULL REFERENCES onboarding_invitations(id) ON DELETE CASCADE,
  ip_address     text NOT NULL,
  attempts       integer NOT NULL DEFAULT 0,
  blocked_until  timestamptz,
  first_attempt  timestamptz NOT NULL DEFAULT now(),
  last_attempt   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, ip_address)
);

CREATE INDEX idx_oa_inv_ip ON onboarding_attempts(invitation_id, ip_address);

ALTER TABLE onboarding_attempts ENABLE ROW LEVEL SECURITY;
-- No public access — all handled via service role in API
