-- Migration 026: fix missing RLS INSERT policies
-- These were omitted from the original 019_rls_policies.sql migration.

-- ── proposals: student INSERT ─
CREATE POLICY "proposals_student_insert" ON proposals
  FOR INSERT WITH CHECK (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = proposals.team_id
        AND tm.student_id = auth.uid()
    )
  );

-- ── proposal_sdgs: student INSERT ─────────
-- Already added in a hotfix but included here for completeness.
-- Use IF NOT EXISTS equivalent via DO block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'proposal_sdgs' AND policyname = 'psdgs_student_insert'
  ) THEN
    CREATE POLICY "psdgs_student_insert" ON proposal_sdgs
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM proposals p
          JOIN team_members tm ON tm.team_id = p.team_id
          WHERE p.id = proposal_sdgs.proposal_id
            AND tm.student_id = auth.uid()
        )
      );
  END IF;
END $$;
