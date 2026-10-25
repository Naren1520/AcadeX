-- Migration 024: team leader can invite students to their team

CREATE TABLE team_invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- team lead
  invitee_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- student invited
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (team_id, invitee_id)  -- one pending invite per student per team
);

CREATE INDEX idx_ti_team    ON team_invitations(team_id);
CREATE INDEX idx_ti_invitee ON team_invitations(invitee_id);
CREATE INDEX idx_ti_inviter ON team_invitations(inviter_id);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Team lead (inviter) can see and create their invitations
CREATE POLICY "ti_inviter_own" ON team_invitations
  FOR ALL USING (inviter_id = auth.uid());

-- Invitee can see and update (accept/decline) their invitations
CREATE POLICY "ti_invitee_select" ON team_invitations
  FOR SELECT USING (invitee_id = auth.uid());

CREATE POLICY "ti_invitee_update" ON team_invitations
  FOR UPDATE USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());

-- Admin/faculty can see all
CREATE POLICY "ti_admin_all" ON team_invitations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
  );
