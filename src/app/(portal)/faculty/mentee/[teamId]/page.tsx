import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { MenteeTeamDashboard } from "./MenteeTeamDashboard";

export default async function MenteeTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const service = getSupabaseServiceRoleClient();

  // Verify this faculty is a mentor for this team
  const { data: mentorship } = await service
    .from("team_mentors")
    .select("id, notes, assigned_by, profiles!team_mentors_assigned_by_fkey(full_name)")
    .eq("team_id", teamId)
    .eq("mentor_id", userId)
    .single();

  if (!mentorship) notFound();

  // Team details
  const { data: team } = await service
    .from("teams")
    .select("id, name, status, section_id, rule_id, sections(label, departments(name, code)), team_formation_rules(label, team_size)")
    .eq("id", teamId)
    .single();

  if (!team) notFound();

  type RawTeam = typeof team & {
    sections: { label: string; departments: { name: string; code: string } | null } | null;
    team_formation_rules: { label: string | null; team_size: number | null } | null;
  };
  const t = team as unknown as RawTeam;

  // Parallel data
  const [
    { data: rawMembers },
    { data: rawProposals },
    { data: rawMilestones },
    { data: rawSubmissions },
  ] = await Promise.all([
    service.from("team_members")
      .select("student_id, is_lead, students!team_members_student_id_fkey(usn, cgpa, profiles(full_name, email))")
      .eq("team_id", teamId),

    service.from("proposals")
      .select("id, title, description, status, version, submitted_at, proposal_sdgs(sdg_number)")
      .eq("team_id", teamId)
      .order("submitted_at", { ascending: false }),

    service.from("milestones")
      .select("id, name, deadline, status, proposal_id")
      .in("proposal_id",
        await service.from("proposals").select("id").eq("team_id", teamId)
          .then(({ data }) => (data ?? []).map((p: { id: string }) => p.id))
      )
      .order("deadline"),

    service.from("submissions")
      .select("id, artefact_type, status, submitted_at, milestone_id")
      .eq("team_id", teamId)
      .order("submitted_at", { ascending: false }),
  ]);

  type RM = { student_id: string; is_lead: boolean; students: { usn: string; cgpa: number; profiles: { full_name: string; email: string } | null } | null };
  const members = (rawMembers as unknown as RM[] ?? []).map((m) => ({
    student_id: m.student_id,
    is_lead:    m.is_lead,
    full_name:  m.students?.profiles?.full_name ?? "",
    email:      m.students?.profiles?.email    ?? "",
    usn:        m.students?.usn  ?? "",
    cgpa:       m.students?.cgpa ?? 0,
  }));

  const avgCgpa = members.length > 0
    ? members.reduce((s, m) => s + m.cgpa, 0) / members.length
    : 0;

  return (
    <Shell role="faculty" navItems={facultyNav}
      breadcrumbs={[
        { label: "Faculty",       href: "/faculty" },
        { label: "Mentee Teams",  href: "/faculty/mentee" },
        { label: t.name },
      ]}
      userFullName={fullName}>
      <PageWrapper
        title={t.name}
        description={`${t.sections?.departments?.name ?? ""} · Section ${t.sections?.label ?? ""} · Mentor Dashboard`}
      >
        <MenteeTeamDashboard
          team={{
            id:           t.id,
            name:         t.name,
            status:       t.status,
            section:      t.sections?.label ?? "",
            dept:         t.sections?.departments?.name ?? "",
            dept_code:    t.sections?.departments?.code ?? "",
            rule_label:   t.team_formation_rules?.label ?? "",
            team_size:    t.team_formation_rules?.team_size ?? 0,
          }}
          members={members}
          avgCgpa={avgCgpa}
          proposals={(rawProposals ?? []) as Record<string, unknown>[]}
          milestones={(rawMilestones ?? []) as Record<string, unknown>[]}
          submissions={(rawSubmissions ?? []) as Record<string, unknown>[]}
          mentorshipNotes={(mentorship as unknown as { notes: string | null }).notes}
          assignedBy={
            (mentorship as unknown as { profiles: { full_name: string } | null }).profiles?.full_name ?? ""
          }
        />
      </PageWrapper>
    </Shell>
  );
}
