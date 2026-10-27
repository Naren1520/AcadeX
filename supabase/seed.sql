-- =============================================================
-- AcadeX Seed Data - Development / Testing
-- =============================================================
-- Run order:
--   1. Apply all migrations (supabase db reset  OR  supabase migration up)
--   2. Run this file:  supabase db seed   OR   psql ... -f supabase/seed.sql
--
-- Dev login credentials
-- ┌──────────┬┬──────────────────┐
-- │ Role     │ Email                     │ Password         │
-- ├──────────┼┼──────────────────┤
-- │ Admin    │ admin@acadex.dev          │ Admin@123        │
-- │ Faculty  │ faculty@acadex.dev        │ Faculty@123      │
-- │ Student  │ student@acadex.dev        │ Student@123      │
-- └──────────┴┴──────────────────┘
-- =============================================================

-- ─── Fixed UUIDs (used across tables) ───
-- Departments
-- CSE  : 11111111-0000-0000-0000-000000000001
-- ECE  : 11111111-0000-0000-0000-000000000002
-- Academic year: 22222222-0000-0000-0000-000000000001
-- Semester    : 33333333-0000-0000-0000-000000000001
-- Section CS-A: 44444444-0000-0000-0000-000000000001
-- Section EC-A: 44444444-0000-0000-0000-000000000002
-- Admin user  : aaaaaaaa-0000-0000-0000-000000000001
-- Faculty user: ffffffff-0000-0000-0000-000000000001
-- Student user: 55555555-0000-0000-0000-000000000001

-- =============================================================
-- STEP 1 - Auth users
-- Creates rows in auth.users directly (works with Supabase local dev).
-- Passwords are bcrypt hashes of the plaintext values above.
-- =============================================================
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
) VALUES
  -- admin@acadex.dev  /  Admin@123
  (
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
  ),
  -- faculty@acadex.dev  /  Faculty@123
  (
    'ffffffff-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'faculty@acadex.dev',
    crypt('Faculty@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now(), '', '', '', ''
  ),
  -- student@acadex.dev  /  Student@123
  (
    '55555555-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@acadex.dev',
    crypt('Student@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required for email/password sign-in)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'admin@acadex.dev',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"admin@acadex.dev"}',
    'email',
    now(), now(), now()
  ),
  (
    'ffffffff-0000-0000-0000-000000000001',
    'ffffffff-0000-0000-0000-000000000001',
    'faculty@acadex.dev',
    '{"sub":"ffffffff-0000-0000-0000-000000000001","email":"faculty@acadex.dev"}',
    'email',
    now(), now(), now()
  ),
  (
    '55555555-0000-0000-0000-000000000001',
    '55555555-0000-0000-0000-000000000001',
    'student@acadex.dev',
    '{"sub":"55555555-0000-0000-0000-000000000001","email":"student@acadex.dev"}',
    'email',
    now(), now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 2 - Departments
-- =============================================================
INSERT INTO departments (id, name, code) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE'),
  ('11111111-0000-0000-0000-000000000002', 'Electronics and Communication Engineering', 'ECE')
ON CONFLICT DO NOTHING;

-- =============================================================
-- STEP 3 - Academic year + semester + sections
-- =============================================================
INSERT INTO academic_years (id, label) VALUES
  ('22222222-0000-0000-0000-000000000001', '2024-25')
ON CONFLICT DO NOTHING;

INSERT INTO semesters (id, academic_year_id, label) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Odd 2024')
ON CONFLICT DO NOTHING;

INSERT INTO sections (id, semester_id, department_id, label) VALUES
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'CS-A'),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'EC-A')
ON CONFLICT DO NOTHING;

-- =============================================================
-- STEP 4 - Profiles (one per auth user)
-- =============================================================
INSERT INTO profiles (id, role, full_name, email) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin',   'Dev Admin',   'admin@acadex.dev'),
  ('ffffffff-0000-0000-0000-000000000001', 'faculty', 'Dev Faculty', 'faculty@acadex.dev'),
  ('55555555-0000-0000-0000-000000000001', 'student', 'Dev Student', 'student@acadex.dev')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 5 - Student record (extends profile for role=student)
-- =============================================================
INSERT INTO students (id, usn, department_id, section_id, cgpa) VALUES
  (
    '55555555-0000-0000-0000-000000000001',
    '1CS21CS001',                                       -- USN (10 alphanumeric chars)
    '11111111-0000-0000-0000-000000000001',             -- CSE
    '44444444-0000-0000-0000-000000000001',             -- CS-A
    8.50
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 6 - Faculty assignment (links faculty to section)
-- =============================================================
INSERT INTO faculty_assignments (faculty_id, section_id, department_id) VALUES
  (
    'ffffffff-0000-0000-0000-000000000001',             -- Dev Faculty
    '44444444-0000-0000-0000-000000000001',             -- CS-A
    '11111111-0000-0000-0000-000000000001'              -- CSE
  )
ON CONFLICT DO NOTHING;
