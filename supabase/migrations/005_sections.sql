-- Migration 005: sections

CREATE TABLE sections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id   uuid NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  label         text NOT NULL,   -- e.g. "CS-A"
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (semester_id, department_id, label)
);

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
