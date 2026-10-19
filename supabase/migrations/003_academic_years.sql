-- Migration 003: academic_years

CREATE TABLE academic_years (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label        text NOT NULL UNIQUE,   -- e.g. "2024-25"
  is_closed    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER academic_years_updated_at
  BEFORE UPDATE ON academic_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
