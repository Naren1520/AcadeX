-- Migration 027: enforce team capacity at DB level (prevents race conditions)
-- Fires BEFORE INSERT on team_members, blocks overflow regardless of app-level checks.

CREATE OR REPLACE FUNCTION check_team_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count integer;
  max_size      integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM team_members WHERE team_id = NEW.team_id;

  SELECT COALESCE(tfr.team_size, tfr.max_team_size, 999)
  INTO max_size
  FROM teams t
  JOIN team_formation_rules tfr ON tfr.id = t.rule_id
  WHERE t.id = NEW.team_id;

  IF current_count >= max_size THEN
    RAISE EXCEPTION 'Team is full (max % members)', max_size
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_team_capacity ON team_members;

CREATE TRIGGER enforce_team_capacity
  BEFORE INSERT ON team_members
  FOR EACH ROW EXECUTE FUNCTION check_team_capacity();
