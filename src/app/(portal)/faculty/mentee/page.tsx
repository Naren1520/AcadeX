import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { MenteeTeamsClient } from "./MenteeTeamsClient";

export type MenteeTeamCard = {
  team_id:        string;
  team_name:      string;
  team_status:    string;
  section_label:  string;
  dept_name:      string;
  assigned_by:    string;   // faculty name
  student_count:  number;
  proposal_count: number;
  milestone_count: number;
  open_milestones: number;
  submission_count: number;
};

export default async function MenteePage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const service = getSupabaseServiceRoleClient();

  // Teams where this faculty is a mentor
  const { data: mentorships } = await service
    .from("team_mentors")
    .select("team_id, notes, assigned_by, profiles!team_mentors_assigned_by_fkey(full_name), teams(id, name, status, section_id, sections(label, departments(name)))")
    .eq("mentor_id", userId);

  if (!mentorships || mentorships.length === 0) {
    return (
      <Shell role="faculty" navItems={facultyNav}
        breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Mentee Teams" }]}
        userFullName={fullName}>
        <PageWrapper title="Mentee Teams" description="Teams assigned to you as project mentor.">
          <div className="rounded-xl p-12 text-center text-sm text-neutral-500"
            style={{ border: "2px dashed #e5e7eb" }}>
            No teams have been assigned to you as mentor yet.
          </div>
        </PageWrapper>
      </Shell>
    );
  }

  type RawM = {
    team_id: string; notes: string | null; assigned_by: string;
    profiles: { full_name: string } | null;
    teams: { id: string; name: string; status: string; section_id: string;
      sections: { label: string; departments: { name: string } | null } | null } | null;
  };
  const teamIds = (mentorships as unknown as RawM[]).map((m) => m.team_id);

  // Parallel stats
  const [
    { data: members },
    { data: proposals },
    { data: milestones },
    { data: submissions },
  ] = await Promise.all([
    service.from("team_members").select("team_id").in("team_id", teamIds),
    service.from("proposals").select("team_id, status").in("team_id", teamIds),
    service.from("milestones").select("id, proposal_id, status, proposals!inner(team_id)")
      .in("proposals.team_id", teamIds),
    service.from("submissions").select("team_id").in("team_id", teamIds),
  ]);

  type MP = { proposals: { team_id: string } | null; status: string };
  const milestonesByTeam: Record<string, { total: number; open: number }> = {};
  (milestones as unknown as MP[] ?? []).forEach((m) => {
    const tid = m.proposals?.team_id;
    if (!tid) return;
    if (!milestonesByTeam[tid]) milestonesByTeam[tid] = { total: 0, open: 0 };
    milestonesByTeam[tid].total++;
    if (m.status === "open") milestonesByTeam[tid].open++;
  });

  const cards: MenteeTeamCard[] = (mentorships as unknown as RawM[]).map((m) => {
    const t   = m.teams;
    const tid = m.team_id;
    return {
      team_id:         tid,
      team_name:       t?.name       ?? "",
      team_status:     t?.status     ?? "",
      section_label:   t?.sections?.label ?? "",
      dept_name:       t?.sections?.departments?.name ?? "",
      assigned_by:     m.profiles?.full_name ?? "",
      student_count:   (members  ?? []).filter((x: { team_id: string }) => x.team_id === tid).length,
      proposal_count:  (proposals ?? []).filter((x: { team_id: string }) => x.team_id === tid).length,
      milestone_count: milestonesByTeam[tid]?.total ?? 0,
      open_milestones: milestonesByTeam[tid]?.open  ?? 0,
      submission_count:(submissions ?? []).filter((x: { team_id: string }) => x.team_id === tid).length,
    };
  });

  return (
    <Shell role="faculty" navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Mentee Teams" }]}
      userFullName={fullName}>
      <PageWrapper title="Mentee Teams"
        description="Teams you are mentoring. Click a team to view the full dashboard.">
        <MenteeTeamsClient cards={cards} />
      </PageWrapper>
    </Shell>
  );
}
