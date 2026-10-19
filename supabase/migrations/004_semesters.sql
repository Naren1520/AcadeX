-- Migration 004: semesters

CREATE TABLE semesters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  label            text NOT NULL,   -- e.g. "Odd 2024"
  is_closed        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, label)
);

CREATE TRIGGER semesters_updated_at
  BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
