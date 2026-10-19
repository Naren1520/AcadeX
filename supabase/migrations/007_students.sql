-- Migration 007: students

CREATE TABLE students (
  id            uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  usn           text NOT NULL UNIQUE CHECK (usn ~ '^[A-Za-z0-9]{10}$'),
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  section_id    uuid REFERENCES sections(id) ON DELETE SET NULL,
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
