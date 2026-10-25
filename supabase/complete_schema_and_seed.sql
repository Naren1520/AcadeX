-- =============================================================
-- AcadeX — Complete Schema + Seed (Clean Install)
-- Run this in Supabase Dashboard → SQL Editor
--
-- ⚠️  WARNING: Drops ALL existing tables and recreates from scratch!
--
-- What this does:
--   1. DROP all existing tables (clean slate)
--   2. CREATE all 18 tables + indexes + triggers
--   3. Enable RLS + create all policies
--   4. Create storage bucket
--   5. Seed admin auth user + profile
--   6. Seed demo departments, academic year, semester, sections
--
-- Admin credentials seeded:
--   Email    : admin@acadex.dev
--   Password : Admin@123
--
-- After running:
--   • Log in at /login with the credentials above
--   • Go to /admin/users to create faculty and student accounts
-- =============================================================
-- =============================================================


-- =============================================================
-- STEP 1 — DROP EVERYTHING (reverse dependency order)
-- =============================================================

DROP TABLE IF EXISTS email_retry_queue    CASCADE;
DROP TABLE IF EXISTS audit_logs           CASCADE;
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS submissions          CASCADE;
DROP TABLE IF EXISTS submission_windows   CASCADE;
DROP TABLE IF EXISTS milestones           CASCADE;
DROP TABLE IF EXISTS proposal_sdgs        CASCADE;
DROP TABLE IF EXISTS proposals            CASCADE;
DROP TABLE IF EXISTS team_members         CASCADE;
DROP TABLE IF EXISTS teams                CASCADE;
DROP TABLE IF EXISTS team_formation_rules CASCADE;
DROP TABLE IF EXISTS students             CASCADE;
DROP TABLE IF EXISTS faculty_assignments  CASCADE;
DROP TABLE IF EXISTS sections             CASCADE;
DROP TABLE IF EXISTS semesters            CASCADE;
DROP TABLE IF EXISTS academic_years       CASCADE;
DROP TABLE IF EXISTS departments          CASCADE;
DROP TABLE IF EXISTS profiles             CASCADE;

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;


-- =============================================================
-- STEP 2 — UTILITY FUNCTION
-- =============================================================

CREATE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- STEP 3 — TABLES
-- =============================================================

-- 001 profiles
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  full_name   text NOT NULL,
  email       text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- 002 departments
CREATE TABLE departments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;


-- 003 academic_years
CREATE TABLE academic_years (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label      text NOT NULL UNIQUE,
  is_closed  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER academic_years_updated_at
  BEFORE UPDATE ON academic_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;


-- 004 semesters
CREATE TABLE semesters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  label            text NOT NULL,
  is_closed        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, label)
);
CREATE TRIGGER semesters_updated_at
  BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;


-- 005 sections
CREATE TABLE sections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id   uuid NOT NULL REFERENCES semesters(id)   ON DELETE RESTRICT,
  department_id uuid NOT NULL REFERENCES departments(id)  ON DELETE RESTRICT,
  label         text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (semester_id, department_id, label)
);
CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;


-- 006 faculty_assignments
CREATE TABLE faculty_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id    uuid NOT NULL REFERENCES profiles(id)    ON DELETE RESTRICT,
  section_id    uuid NOT NULL REFERENCES sections(id)    ON DELETE RESTRICT,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (faculty_id, section_id)
);
CREATE INDEX idx_faculty_assignments_faculty    ON faculty_assignments(faculty_id);
CREATE INDEX idx_faculty_assignments_section    ON faculty_assignments(section_id);
CREATE INDEX idx_faculty_assignments_department ON faculty_assignments(department_id);
ALTER TABLE faculty_assignments ENABLE ROW LEVEL SECURITY;


-- 007 students
CREATE TABLE students (
  id            uuid PRIMARY KEY REFERENCES profiles(id)     ON DELETE CASCADE,
  usn           text NOT NULL UNIQUE CHECK (usn ~ '^[A-Za-z0-9]{10}$'),
  department_id uuid NOT NULL REFERENCES departments(id)     ON DELETE RESTRICT,
  section_id    uuid         REFERENCES sections(id)         ON DELETE SET NULL,
  cgpa          numeric(4,2) NOT NULL CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
  skills        text[] NOT NULL DEFAULT '{}'
                  CHECK (array_length(skills, 1) IS NULL OR array_length(skills, 1) <= 20),
  github_url    text CHECK (
                  github_url IS NULL OR
                  github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+$'
                ),
  resume_path   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_section    ON students(section_id);
CREATE INDEX idx_students_cgpa       ON students(cgpa);
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE students ENABLE ROW LEVEL SECURITY;


-- 008 team_formation_rules
CREATE TABLE team_formation_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id    uuid NOT NULL REFERENCES profiles(id)  ON DELETE RESTRICT,
  section_id    uuid NOT NULL REFERENCES sections(id)  ON DELETE RESTRICT,
  cgpa_lower    numeric(4,2) NOT NULL CHECK (cgpa_lower >= 0.00 AND cgpa_lower <= 10.00),
  cgpa_upper    numeric(4,2) NOT NULL CHECK (cgpa_upper >= 0.00 AND cgpa_upper <= 10.00),
  min_team_size integer NOT NULL CHECK (min_team_size >= 1),
  max_team_size integer NOT NULL CHECK (max_team_size >= min_team_size),
  max_teams     integer NOT NULL CHECK (max_teams >= 1),
  is_enabled    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (cgpa_upper >= cgpa_lower)
);
CREATE INDEX idx_tfr_section ON team_formation_rules(section_id);
CREATE INDEX idx_tfr_faculty ON team_formation_rules(faculty_id);
CREATE TRIGGER team_formation_rules_updated_at
  BEFORE UPDATE ON team_formation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE team_formation_rules ENABLE ROW LEVEL SECURITY;


-- 009 teams
CREATE TABLE teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES sections(id)             ON DELETE RESTRICT,
  rule_id    uuid NOT NULL REFERENCES team_formation_rules(id) ON DELETE RESTRICT,
  name       text NOT NULL,
  status     text NOT NULL DEFAULT 'forming'
               CHECK (status IN ('forming', 'confirmed', 'dissolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_teams_section ON teams(section_id);
CREATE INDEX idx_teams_rule    ON teams(rule_id);
CREATE INDEX idx_teams_status  ON teams(status);
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;


-- 010 team_members
CREATE TABLE team_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    uuid NOT NULL REFERENCES teams(id)    ON DELETE RESTRICT,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  is_lead    boolean NOT NULL DEFAULT false,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, student_id),
  UNIQUE (student_id)
);
CREATE INDEX idx_team_members_team    ON team_members(team_id);
CREATE INDEX idx_team_members_student ON team_members(student_id);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;


-- 011 proposals
CREATE TABLE proposals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id            uuid NOT NULL REFERENCES teams(id)    ON DELETE RESTRICT,
  faculty_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title              text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description        text NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  parent_proposal_id uuid REFERENCES proposals(id)         ON DELETE SET NULL,
  version            integer NOT NULL DEFAULT 1,
  rejection_reason   text CHECK (rejection_reason IS NULL OR char_length(rejection_reason) >= 10),
  revision_notes     text CHECK (revision_notes IS NULL OR char_length(revision_notes) >= 10),
  reviewed_at        timestamptz,
  submitted_at       timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_proposals_team    ON proposals(team_id);
CREATE INDEX idx_proposals_faculty ON proposals(faculty_id);
CREATE INDEX idx_proposals_status  ON proposals(status);
CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;


-- 012 proposal_sdgs
CREATE TABLE proposal_sdgs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sdg_number  integer NOT NULL CHECK (sdg_number BETWEEN 1 AND 17),
  UNIQUE (proposal_id, sdg_number)
);
CREATE INDEX idx_proposal_sdgs_proposal ON proposal_sdgs(proposal_id);
ALTER TABLE proposal_sdgs ENABLE ROW LEVEL SECURITY;


-- 013 milestones
CREATE TABLE milestones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  faculty_id  uuid NOT NULL REFERENCES profiles(id)  ON DELETE RESTRICT,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  deadline    timestamptz NOT NULL,
  status      text NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'completed', 'missed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_milestones_proposal ON milestones(proposal_id);
CREATE INDEX idx_milestones_deadline ON milestones(deadline);
CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;


-- 014 submission_windows
CREATE TABLE submission_windows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
  faculty_id   uuid NOT NULL REFERENCES profiles(id)   ON DELETE RESTRICT,
  opens_at     timestamptz NOT NULL,
  closes_at    timestamptz NOT NULL,
  CHECK (closes_at > opens_at),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sw_milestone ON submission_windows(milestone_id);
CREATE INDEX idx_sw_closes_at ON submission_windows(closes_at);
ALTER TABLE submission_windows ENABLE ROW LEVEL SECURITY;


-- 015 submissions
CREATE TABLE submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL REFERENCES teams(id)              ON DELETE RESTRICT,
  milestone_id  uuid NOT NULL REFERENCES milestones(id)         ON DELETE RESTRICT,
  window_id     uuid NOT NULL REFERENCES submission_windows(id) ON DELETE RESTRICT,
  submitted_by  uuid NOT NULL REFERENCES profiles(id)           ON DELETE RESTRICT,
  artefact_type text NOT NULL CHECK (artefact_type IN ('ppt', 'report', 'github_link')),
  storage_path  text,
  github_url    text CHECK (
                  github_url IS NULL OR
                  github_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
                ),
  status        text NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted', 'accepted', 'missed_deadline')),
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, milestone_id, window_id, artefact_type)
);
CREATE INDEX idx_submissions_team      ON submissions(team_id);
CREATE INDEX idx_submissions_milestone ON submissions(milestone_id);
CREATE INDEX idx_submissions_window    ON submissions(window_id);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;


-- 016 notifications
CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message       text NOT NULL,
  deep_link     text NOT NULL,
  trigger_event text NOT NULL,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read      ON notifications(recipient_id, is_read);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- 017 audit_logs
CREATE TABLE audit_logs (
  event_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  actor_role       text NOT NULL CHECK (actor_role IN ('admin', 'faculty', 'student', 'system')),
  action_type      text NOT NULL,
  target_table     text NOT NULL,
  target_record_id uuid NOT NULL,
  previous_value   jsonb,
  new_value        jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor   ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action  ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target  ON audit_logs(target_table, target_record_id);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- 018 email_retry_queue
CREATE TABLE email_retry_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  trigger_event   text NOT NULL,
  attempt_count   integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  exhausted       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_retry_pending ON email_retry_queue(next_attempt_at)
  WHERE NOT exhausted;
CREATE TRIGGER email_retry_queue_updated_at
  BEFORE UPDATE ON email_retry_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE email_retry_queue ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- STEP 4 — RLS HELPER + POLICIES
-- =============================================================

CREATE FUNCTION current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- profiles
CREATE POLICY "profiles_select_own"      ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_admin_all"        ON profiles FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY "profiles_faculty_select"   ON profiles FOR SELECT USING (id = auth.uid() OR current_user_role() = 'faculty');

-- departments
CREATE POLICY "departments_select_all"   ON departments FOR SELECT USING (true);
CREATE POLICY "departments_admin_write"  ON departments FOR ALL    USING (current_user_role() = 'admin');

-- academic_years
CREATE POLICY "academic_years_select"    ON academic_years FOR SELECT USING (true);
CREATE POLICY "academic_years_admin"     ON academic_years FOR ALL    USING (current_user_role() = 'admin');

-- semesters
CREATE POLICY "semesters_select"         ON semesters FOR SELECT USING (true);
CREATE POLICY "semesters_admin"          ON semesters FOR ALL    USING (current_user_role() = 'admin');

-- sections
CREATE POLICY "sections_select"          ON sections FOR SELECT USING (true);
CREATE POLICY "sections_admin"           ON sections FOR ALL    USING (current_user_role() = 'admin');

-- faculty_assignments
CREATE POLICY "fa_faculty_select_own"    ON faculty_assignments FOR SELECT USING (faculty_id = auth.uid());
CREATE POLICY "fa_admin_all"             ON faculty_assignments FOR ALL    USING (current_user_role() = 'admin');

-- students
CREATE POLICY "students_select_own"      ON students FOR SELECT USING (id = auth.uid());
CREATE POLICY "students_update_own"      ON students FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "students_faculty_select"  ON students FOR SELECT USING (
  current_user_role() = 'faculty' AND
  EXISTS (SELECT 1 FROM faculty_assignments fa WHERE fa.faculty_id = auth.uid() AND fa.department_id = students.department_id)
);
CREATE POLICY "students_faculty_update"  ON students FOR UPDATE USING (
  current_user_role() = 'faculty' AND
  EXISTS (SELECT 1 FROM faculty_assignments fa WHERE fa.faculty_id = auth.uid() AND fa.department_id = students.department_id)
);
CREATE POLICY "students_admin_all"       ON students FOR ALL USING (current_user_role() = 'admin');

-- team_formation_rules
CREATE POLICY "tfr_faculty_own"          ON team_formation_rules FOR ALL    USING (current_user_role() = 'faculty' AND faculty_id = auth.uid());
CREATE POLICY "tfr_student_select"       ON team_formation_rules FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (SELECT 1 FROM students s WHERE s.id = auth.uid() AND s.section_id = team_formation_rules.section_id)
);
CREATE POLICY "tfr_admin_all"            ON team_formation_rules FOR ALL USING (current_user_role() = 'admin');

-- teams
CREATE POLICY "teams_student_select"     ON teams FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (SELECT 1 FROM students s WHERE s.id = auth.uid() AND s.section_id = teams.section_id)
);
CREATE POLICY "teams_faculty_select"     ON teams FOR SELECT USING (
  current_user_role() = 'faculty' AND
  EXISTS (SELECT 1 FROM faculty_assignments fa WHERE fa.faculty_id = auth.uid() AND fa.section_id = teams.section_id)
);
CREATE POLICY "teams_admin_all"          ON teams FOR ALL USING (current_user_role() = 'admin');

-- team_members
CREATE POLICY "tm_student_select"        ON team_members FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (
    SELECT 1 FROM teams t JOIN students s ON s.id = auth.uid()
    WHERE t.id = team_members.team_id AND t.section_id = s.section_id
  )
);
CREATE POLICY "tm_faculty_select"        ON team_members FOR SELECT USING (
  current_user_role() = 'faculty' AND
  EXISTS (
    SELECT 1 FROM teams t JOIN faculty_assignments fa ON fa.section_id = t.section_id
    WHERE t.id = team_members.team_id AND fa.faculty_id = auth.uid()
  )
);
CREATE POLICY "tm_admin_all"             ON team_members FOR ALL USING (current_user_role() = 'admin');

-- proposals
CREATE POLICY "proposals_student_select" ON proposals FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = proposals.team_id AND tm.student_id = auth.uid())
);
CREATE POLICY "proposals_faculty_select" ON proposals FOR SELECT USING (current_user_role() = 'faculty' AND faculty_id = auth.uid());
CREATE POLICY "proposals_faculty_update" ON proposals FOR UPDATE USING (current_user_role() = 'faculty' AND faculty_id = auth.uid());
CREATE POLICY "proposals_admin_all"      ON proposals FOR ALL USING (current_user_role() = 'admin');

-- proposal_sdgs
CREATE POLICY "psdgs_select"             ON proposal_sdgs FOR SELECT USING (
  EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_sdgs.proposal_id)
);
CREATE POLICY "psdgs_admin_all"          ON proposal_sdgs FOR ALL USING (current_user_role() = 'admin');

-- milestones
CREATE POLICY "milestones_student_select" ON milestones FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (
    SELECT 1 FROM proposals p JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = milestones.proposal_id AND tm.student_id = auth.uid()
  )
);
CREATE POLICY "milestones_faculty_own"   ON milestones FOR ALL    USING (current_user_role() = 'faculty' AND faculty_id = auth.uid());
CREATE POLICY "milestones_admin_all"     ON milestones FOR ALL    USING (current_user_role() = 'admin');

-- submission_windows
CREATE POLICY "sw_select_all_auth"       ON submission_windows FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sw_faculty_own"           ON submission_windows FOR ALL    USING (current_user_role() = 'faculty' AND faculty_id = auth.uid());
CREATE POLICY "sw_admin_all"             ON submission_windows FOR ALL    USING (current_user_role() = 'admin');

-- submissions
CREATE POLICY "sub_student_select"       ON submissions FOR SELECT USING (
  current_user_role() = 'student' AND
  EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = submissions.team_id AND tm.student_id = auth.uid())
);
CREATE POLICY "sub_student_insert"       ON submissions FOR INSERT WITH CHECK (
  current_user_role() = 'student' AND
  EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = submissions.team_id AND tm.student_id = auth.uid())
);
CREATE POLICY "sub_faculty_select"       ON submissions FOR SELECT USING (
  current_user_role() = 'faculty' AND
  EXISTS (
    SELECT 1 FROM teams t JOIN faculty_assignments fa ON fa.section_id = t.section_id
    WHERE t.id = submissions.team_id AND fa.faculty_id = auth.uid()
  )
);
CREATE POLICY "sub_admin_all"            ON submissions FOR ALL USING (current_user_role() = 'admin');

-- notifications
CREATE POLICY "notif_own_select"         ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notif_own_update"         ON notifications FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "notif_admin_all"          ON notifications FOR ALL    USING (current_user_role() = 'admin');

-- audit_logs
CREATE POLICY "audit_insert_only"        ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_admin_select"       ON audit_logs FOR SELECT USING (current_user_role() = 'admin');


-- =============================================================
-- STEP 5 — STORAGE BUCKET
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('acadex-artefacts', 'acadex-artefacts', false)
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- STEP 6 — SEED DATA
-- =============================================================
--
-- Admin login credentials:
--   Email    : admin@acadex.dev
--   Password : Admin@123
--
-- ⚠️  Change the password after first login!
--
-- After logging in, go to /admin/users to create faculty/student accounts.
-- =============================================================

-- ── Admin auth user 
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@acadex.dev',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(), now(), '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'admin@acadex.dev',
  '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"admin@acadex.dev"}',
  'email',
  now(), now(), now()
)
ON CONFLICT (id) DO NOTHING;

-- ── Admin profile 
INSERT INTO profiles (id, role, full_name, email) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'admin',
  'Admin',
  'admin@acadex.dev'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- =============================================================
-- ✅  DONE
--
--   Admin email    : admin@acadex.dev
--   Admin password : Admin@123
--
--   Log in at /login, then create everything through the admin portal.
-- =============================================================
