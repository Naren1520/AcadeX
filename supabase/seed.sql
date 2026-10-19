-- Seed data for AcadeX development / testing
-- Run AFTER all migrations have been applied.
-- Note: auth.users rows must be created via Supabase Auth Admin API or Dashboard first.
-- These UUIDs are placeholders — replace with real auth.users IDs in your dev project.

-- ─── Departments ───────────────────────────────────────────────
INSERT INTO departments (id, name, code) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE'),
  ('11111111-0000-0000-0000-000000000002', 'Electronics and Communication Engineering', 'ECE')
ON CONFLICT DO NOTHING;

-- ─── Academic Year ─────────────────────────────────────────────
INSERT INTO academic_years (id, label) VALUES
  ('22222222-0000-0000-0000-000000000001', '2024-25')
ON CONFLICT DO NOTHING;

-- ─── Semester ──────────────────────────────────────────────────
INSERT INTO semesters (id, academic_year_id, label) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Odd 2024')
ON CONFLICT DO NOTHING;

-- ─── Sections ──────────────────────────────────────────────────
INSERT INTO sections (id, semester_id, department_id, label) VALUES
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'CS-A'),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'EC-A')
ON CONFLICT DO NOTHING;

-- ─── Sample Team Formation Rules ───────────────────────────────
-- (faculty_id references must be replaced with real UUIDs)
-- INSERT INTO team_formation_rules (faculty_id, section_id, cgpa_lower, cgpa_upper, min_team_size, max_team_size, max_teams)
-- VALUES ('faculty-uuid-here', '44444444-0000-0000-0000-000000000001', 7.00, 10.00, 2, 4, 5);

-- ─── Notes ─────────────────────────────────────────────────────
-- 1. Create auth users via Supabase Dashboard or Admin API first.
-- 2. The trigger on auth.users should create profiles rows automatically
--    (set this up via a Supabase database function / trigger on auth.users).
-- 3. Student records require a matching profiles row with role='student'.
