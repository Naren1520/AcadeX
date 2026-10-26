import { notFound, redirect } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TeamsClient } from "./TeamsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentTeamsPage() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const supabase  = await getSupabaseServerClient();
  const service   = getSupabaseServiceRoleClient();

  const [{ data: student }, { data: membership }] = await Promise.all([
    supabase.from("students").select("cgpa, section_id, department_id").eq("id", userId).single(),
    supabase.from("team_members")
      .select("team_id, is_lead, teams(id, name, status, rule_id, team_formation_rules(*, team_formation_slots(*)))")
      .eq("student_id", userId).maybeSingle(),
  ]);

  const sectionId = student?.section_id ?? null;
  const myTeamId  = (membership?.team_id) ?? null;

  // If already in a team, go straight to team dashboard
  if (myTeamId) redirect(`/student/teams/${myTeamId}`);

  const [
    { data: sectionTeams },
    { data: rules },
    { data: rawInvitations },
    { data: rawSectionmates },
    { data: rawTeamMembers },
    { data: rawSentInvitations },
  ] = await Promise.all([
    sectionId
      ? supabase.from("teams")
          .select("id, name, status, rule_id, team_formation_rules(*, team_formation_slots(*))")
          .eq("section_id", sectionId).eq("status", "forming")
      : Promise.resolve({ data: [] }),

    sectionId
      ? supabase.from("team_formation_rules")
          .select("*, team_formation_slots(*)")
          .eq("section_id", sectionId).eq("is_enabled", true)
      : Promise.resolve({ data: [] }),

    // Pending invitations for this student
    supabase.from("team_invitations")
      .select("id, team_id, created_at, teams(id, name, status), profiles!team_invitations_inviter_id_fkey(full_name, email)")
      .eq("invitee_id", userId).eq("status", "pending")
      .order("created_at", { ascending: false }),

    // Section mates not already in a team (for invite list when this student is a lead)
    sectionId
      ? service.from("students")
          .select("id, usn, cgpa, profiles(full_name, email)")
          .eq("section_id", sectionId)
          .neq("id", userId)
      : Promise.resolve({ data: [] }),

    // Current team members (if in a team)
    myTeamId
      ? service.from("team_members")
          .select("student_id, is_lead, students!team_members_student_id_fkey(usn, cgpa, profiles(full_name, email))")
          .eq("team_id", myTeamId)
      : Promise.resolve({ data: [] }),

    // Invitations sent by this student (pending only)
    myTeamId
      ? service.from("team_invitations")
          .select("id, invitee_id, status, profiles!team_invitations_invitee_id_fkey(full_name, email)")
          .eq("team_id", myTeamId)
          .eq("inviter_id", userId)
          .eq("status", "pending")
      : Promise.resolve({ data: [] }),
  ]);

  // Filter sectionmates to only those not in any team
  type RawSM = { id: string; usn: string; cgpa: number; profiles: { full_name: string; email: string } | null };
  const allSectionmates = (rawSectionmates as unknown as RawSM[] ?? []);

  const { data: existingMembers } = allSectionmates.length > 0
    ? await service.from("team_members")
        .select("student_id")
        .in("student_id", allSectionmates.map((s) => s.id))
    : { data: [] };

  const inTeamIds = new Set((existingMembers ?? []).map((m: { student_id: string }) => m.student_id));

  const sectionmates = allSectionmates
    .filter((s) => !inTeamIds.has(s.id))
    .map((s) => ({
      id:        s.id,
      usn:       s.usn,
      cgpa:      s.cgpa,
      full_name: s.profiles?.full_name ?? "",
      email:     s.profiles?.email    ?? "",
    }));

  type RawInv = {
    id: string; team_id: string; created_at: string;
    teams: { id: string; name: string; status: string } | null;
    profiles: { full_name: string; email: string } | null;
  };
  const pendingInvitations = (rawInvitations as unknown as RawInv[] ?? []);

  // Shape team members
  type RawMember = {
    student_id: string; is_lead: boolean;
    students: { usn: string; cgpa: number; profiles: { full_name: string; email: string } | null } | null;
  };
  const teamMembers = (rawTeamMembers as unknown as RawMember[] ?? []).map((m) => ({
    student_id: m.student_id,
    is_lead:    m.is_lead,
    full_name:  m.students?.profiles?.full_name ?? "",
    email:      m.students?.profiles?.email    ?? "",
    usn:        m.students?.usn                ?? "",
    cgpa:       m.students?.cgpa               ?? 0,
  }));

  // Shape sent invitations
  type RawSentInv = {
    id: string; invitee_id: string; status: string;
    profiles: { full_name: string; email: string } | null;
  };
  const sentInvitations = (rawSentInvitations as unknown as RawSentInv[] ?? []).map((i) => ({
    id:         i.id,
    invitee_id: i.invitee_id,
    status:     i.status,
    full_name:  i.profiles?.full_name ?? "",
    email:      i.profiles?.email    ?? "",
  }));

  return (
    <Shell role="student" navItems={studentNav}
      breadcrumbs={[{ label: "Student", href: "/student" }, { label: "My Team" }]}
      userFullName={fullName}>
      <PageWrapper title="Team Formation" description="Join a team, accept an invitation, or form your own.">
        <TeamsClient
          studentId={userId}
          studentCgpa={student?.cgpa ?? 0}
          sectionId={sectionId}
          currentMembership={membership as Record<string, unknown> | null}
          sectionTeams={(sectionTeams ?? []) as Record<string, unknown>[]}
          rules={(rules ?? []) as Record<string, unknown>[]}
          pendingInvitations={pendingInvitations}
          sectionmates={sectionmates}
          teamMembers={teamMembers}
          sentInvitations={sentInvitations}
        />
      </PageWrapper>
    </Shell>
  );
}
