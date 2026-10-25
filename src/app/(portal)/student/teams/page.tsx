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

  const [
    { data: sectionTeams },
    { data: rules },
    { data: rawInvitations },
    { data: rawSectionmates },
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
        />
      </PageWrapper>
    </Shell>
  );
}
