-- Migration 019: RLS Policies

-- Helper function: returns the role of the current session user from profiles table
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 
-- profiles
-- 
CREATE POLICY "profiles_student_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "profiles_faculty_select_own" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR current_user_role() = 'faculty'
  );

-- 
-- departments (read-only for non-admin)
-- 
CREATE POLICY "departments_all_select" ON departments
  FOR SELECT USING (true);

CREATE POLICY "departments_admin_write" ON departments
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- academic_years, semesters, sections (read for all, write for admin)
-- 
CREATE POLICY "academic_years_select_all" ON academic_years
  FOR SELECT USING (true);
CREATE POLICY "academic_years_admin_write" ON academic_years
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "semesters_select_all" ON semesters
  FOR SELECT USING (true);
CREATE POLICY "semesters_admin_write" ON semesters
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "sections_select_all" ON sections
  FOR SELECT USING (true);
CREATE POLICY "sections_admin_write" ON sections
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- faculty_assignments
-- 
CREATE POLICY "faculty_assignments_faculty_select_own" ON faculty_assignments
  FOR SELECT USING (faculty_id = auth.uid());

CREATE POLICY "faculty_assignments_admin_all" ON faculty_assignments
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- students
-- 
CREATE POLICY "students_select_own" ON students
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "students_update_own_non_cgpa" ON students
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Faculty can read/update students in their assigned department
CREATE POLICY "students_faculty_assigned_dept" ON students
  FOR SELECT USING (
    current_user_role() = 'faculty' AND
    EXISTS (
      SELECT 1 FROM faculty_assignments fa
      WHERE fa.faculty_id = auth.uid()
        AND fa.department_id = students.department_id
    )
  );

CREATE POLICY "students_faculty_update_cgpa" ON students
  FOR UPDATE USING (
    current_user_role() = 'faculty' AND
    EXISTS (
      SELECT 1 FROM faculty_assignments fa
      WHERE fa.faculty_id = auth.uid()
        AND fa.department_id = students.department_id
    )
  );

CREATE POLICY "students_admin_all" ON students
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- team_formation_rules
-- 
CREATE POLICY "tfr_faculty_own" ON team_formation_rules
  FOR ALL USING (
    current_user_role() = 'faculty' AND faculty_id = auth.uid()
  );

CREATE POLICY "tfr_student_select" ON team_formation_rules
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = auth.uid()
        AND s.section_id = team_formation_rules.section_id
    )
  );

CREATE POLICY "tfr_admin_all" ON team_formation_rules
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- teams
-- 
CREATE POLICY "teams_student_select_own_section" ON teams
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = auth.uid()
        AND s.section_id = teams.section_id
    )
  );

CREATE POLICY "teams_faculty_select_assigned" ON teams
  FOR SELECT USING (
    current_user_role() = 'faculty' AND
    EXISTS (
      SELECT 1 FROM faculty_assignments fa
      WHERE fa.faculty_id = auth.uid()
        AND fa.section_id = teams.section_id
    )
  );

CREATE POLICY "teams_admin_all" ON teams
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- team_members
-- 
CREATE POLICY "team_members_student_select_own_section" ON team_members
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM teams t
      JOIN students s ON s.id = auth.uid()
      WHERE t.id = team_members.team_id
        AND t.section_id = s.section_id
    )
  );

CREATE POLICY "team_members_faculty_select_assigned" ON team_members
  FOR SELECT USING (
    current_user_role() = 'faculty' AND
    EXISTS (
      SELECT 1 FROM teams t
      JOIN faculty_assignments fa ON fa.section_id = t.section_id
      WHERE t.id = team_members.team_id
        AND fa.faculty_id = auth.uid()
    )
  );

CREATE POLICY "team_members_admin_all" ON team_members
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- proposals
-- 
CREATE POLICY "proposals_student_own_team" ON proposals
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = proposals.team_id
        AND tm.student_id = auth.uid()
    )
  );

CREATE POLICY "proposals_faculty_assigned" ON proposals
  FOR SELECT USING (
    current_user_role() = 'faculty' AND faculty_id = auth.uid()
  );

CREATE POLICY "proposals_faculty_update" ON proposals
  FOR UPDATE USING (
    current_user_role() = 'faculty' AND faculty_id = auth.uid()
  );

CREATE POLICY "proposals_admin_all" ON proposals
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- submissions
-- 
CREATE POLICY "submissions_student_own_team" ON submissions
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = submissions.team_id
        AND tm.student_id = auth.uid()
    )
  );

CREATE POLICY "submissions_student_insert_own_team" ON submissions
  FOR INSERT WITH CHECK (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = submissions.team_id
        AND tm.student_id = auth.uid()
    )
  );

CREATE POLICY "submissions_faculty_select_assigned" ON submissions
  FOR SELECT USING (
    current_user_role() = 'faculty' AND
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN teams t ON t.id = submissions.team_id
      JOIN faculty_assignments fa ON fa.section_id = t.section_id
      WHERE fa.faculty_id = auth.uid()
    )
  );

CREATE POLICY "submissions_admin_all" ON submissions
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- milestones
-- 
CREATE POLICY "milestones_student_select" ON milestones
  FOR SELECT USING (
    current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = milestones.proposal_id
        AND tm.student_id = auth.uid()
    )
  );

CREATE POLICY "milestones_faculty_own" ON milestones
  FOR ALL USING (
    current_user_role() = 'faculty' AND faculty_id = auth.uid()
  );

CREATE POLICY "milestones_admin_all" ON milestones
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- notifications
-- 
CREATE POLICY "notifications_own" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "notifications_own_update" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- proposal_sdgs
-- 
CREATE POLICY "proposal_sdgs_select" ON proposal_sdgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sdgs.proposal_id
    )
  );

CREATE POLICY "proposal_sdgs_admin_all" ON proposal_sdgs
  FOR ALL USING (current_user_role() = 'admin');

-- 
-- submission_windows
-- 
CREATE POLICY "sw_select_all_authenticated" ON submission_windows
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sw_faculty_own" ON submission_windows
  FOR ALL USING (
    current_user_role() = 'faculty' AND faculty_id = auth.uid()
  );

CREATE POLICY "sw_admin_all" ON submission_windows
  FOR ALL USING (current_user_role() = 'admin');
