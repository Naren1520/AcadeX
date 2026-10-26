import { notFound, redirect } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { studentNav } from "@/config/navigation";
import { TeamDashboard } from "./TeamDashboard";

export type TeamPageMember = {
  student_id: string; is_lead: boolean;
  full_name: string; email: string; usn: string; cgpa: number;
};

export type TeamPageMentor = {
  mentor_id: string; full_name: string; email: string;
};

export type TeamPageProposal = {
  id: string; title: string; status: string; version: number; submitted_at: string;
};

export type TeamPageMilestone = {
  id: string; name: string; deadline: string; status: string;
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { userId, fullName } = await requirePageRole(["student"]);
  const service = getSupabaseServiceRoleClient();

  // Verify student is in this team
  const { data: membership } = await service
    .from("team_members")
    .select("is_lead")
    .eq("team_id", teamId)
    .eq("student_id", userId)
    .maybeSingle();

  if (!membership) redirect("/student/teams");

  const { data: team } = await service
    .from("teams")
    .select("id, name, status, section_id, rule_id, sections(label, departments(name)), team_formation_rules(label, team_size, team_formation_slots(*))")
    .eq("id", teamId)
    .single();

  if (!team) notFound();

  const [
    { data: rawMembers },
    { data: rawMentor },
    { data: rawProposals },
    { data: rawMilestones },
  ] = await Promise.all([
    service.from("team_members")
      .select("student_id, is_lead, students!team_members_student_id_fkey(usn, cgpa, profiles(full_name, email))")
      .eq("team_id", teamId),
    service.from("team_mentors")
      .select("mentor_id, profiles!team_mentors_mentor_id_fkey(full_name, email)")
      .eq("team_id", teamId)
      .maybeSingle(),
    service.from("proposals")
      .select("id, title, status, version, submitted_at")
      .eq("team_id", teamId)
      .order("submitted_at", { ascending: false }),
    service.from("milestones")
      .select("id, name, deadline, status")
      .in("proposal_id",
        await service.from("proposals").select("id").eq("team_id", teamId)
          .then(({ data }) => (data ?? []).map((p: { id: string }) => p.id))
      )
      .order("deadline"),
  ]);

  type RM = { student_id: string; is_lead: boolean; students: { usn: string; cgpa: number; profiles: { full_name: string; email: string } | null } | null };
  const members: TeamPageMember[] = (rawMembers as unknown as RM[] ?? []).map((m) => ({
    student_id: m.student_id, is_lead: m.is_lead,
    full_name: m.students?.profiles?.full_name ?? "",
    email:     m.students?.profiles?.email    ?? "",
    usn:       m.students?.usn  ?? "",
    cgpa:      m.students?.cgpa ?? 0,
  }));

  type RawMent = { mentor_id: string; profiles: { full_name: string; email: string } | null } | null;
  const mentor: TeamPageMentor | null = rawMentor
    ? { mentor_id: (rawMentor as unknown as RawMent)?.mentor_id ?? "", full_name: (rawMentor as unknown as RawMent)?.profiles?.full_name ?? "", email: (rawMentor as unknown as RawMent)?.profiles?.email ?? "" }
    : null;

  type RawTeam = typeof team & {
    sections: { label: string; departments: { name: string } | null } | null;
    team_formation_rules: { label: string | null; team_size: number | null; team_formation_slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[] } | null;
  };
  const t = team as unknown as RawTeam;

  return (
    <Shell role="student" navItems={studentNav}
      breadcrumbs={[
        { label: "Student", href: "/student" },
        { label: "My Team",  href: "/student/teams" },
        { label: t.name },
      ]}
      userFullName={fullName}>
      <PageWrapper title={t.name}
        description={`${t.sections?.departments?.name ?? ""} · Section ${t.sections?.label ?? ""}`}>
        <TeamDashboard
          teamId={teamId}
          teamName={t.name}
          teamStatus={t.status as "forming" | "confirmed" | "dissolved"}
          currentUserId={userId}
          isLead={!!membership.is_lead}
          members={members}
          mentor={mentor}
          proposals={(rawProposals ?? []) as TeamPageProposal[]}
          milestones={(rawMilestones ?? []) as TeamPageMilestone[]}
          ruleLabel={t.team_formation_rules?.label ?? ""}
          teamSize={t.team_formation_rules?.team_size ?? 0}
          slots={t.team_formation_rules?.team_formation_slots ?? []}
        />
      </PageWrapper>
    </Shell>
  );
}
