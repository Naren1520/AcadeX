-- Migration 006: faculty_assignments

CREATE TABLE faculty_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  section_id    uuid NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (faculty_id, section_id)
);

CREATE INDEX idx_faculty_assignments_faculty    ON faculty_assignments(faculty_id);
CREATE INDEX idx_faculty_assignments_section    ON faculty_assignments(section_id);
CREATE INDEX idx_faculty_assignments_department ON faculty_assignments(department_id);

ALTER TABLE faculty_assignments ENABLE ROW LEVEL SECURITY;
