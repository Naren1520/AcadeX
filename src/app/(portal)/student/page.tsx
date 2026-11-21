import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { studentNav } from "@/config/navigation";
import { StudentDashboardClient } from "./StudentDashboardClient";

export default async function StudentDashboard() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const service = getSupabaseServiceRoleClient();

  const [
    { data: studentRecord },
    { data: teamMembership },
  ] = await Promise.all([
    service.from("students").select("cgpa, usn").eq("id", userId).single(),
    service
      .from("team_members")
      .select("team_id, is_lead, teams(name, status)")
      .eq("student_id", userId)
      .maybeSingle(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = teamMembership as any;
  const teamId: string | null = m?.team_id ?? null;
  const team = m?.teams ?? null;

  const [
    { data: proposals },
    { data: milestones },
    { data: submissions },
  ] = await Promise.all([
    teamId
      ? service.from("proposals").select("id, status").eq("team_id", teamId)
      : Promise.resolve({ data: [] }),
    teamId
      ? service
          .from("milestones")
          .select("id, name, deadline, status, proposal_id")
          .in("proposal_id",
            await service.from("proposals").select("id").eq("team_id", teamId)
              .then(({ data }) => (data ?? []).map((p: { id: string }) => p.id))
          )
          .order("deadline")
      : Promise.resolve({ data: [] }),
    teamId
      ? service.from("submissions").select("id").eq("team_id", teamId)
      : Promise.resolve({ data: [] }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sr = studentRecord as any;
  const proposalList = proposals ?? [];
  const milestoneList = milestones ?? [];

  const approvedProposals = proposalList.filter((p: { status: string }) => p.status === "approved").length;
  const pendingProposals  = proposalList.filter((p: { status: string }) => p.status === "pending").length;

  const completedMilestones = milestoneList.filter((m: { status: string }) => m.status === "completed").length;
  const openMilestones      = milestoneList.filter((m: { status: string }) => m.status === "open").length;
  const missedMilestones    = milestoneList.filter((m: { status: string }) => m.status === "missed").length;

  const upcoming = milestoneList
    .filter((m: { status: string; deadline: string }) =>
      m.status === "open" && new Date(m.deadline) > new Date()
    )
    .slice(0, 5)
    .map((m: { name: string; deadline: string; status: string }) => ({
      name: m.name,
      deadline: m.deadline,
      status: m.status,
    }));

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      userFullName={fullName}
    >
      <PageWrapper
        title="Student Dashboard"
        description="Your academic project overview."
      >
        <StudentDashboardClient
          fullName={fullName}
          usn={sr?.usn ?? "-"}
          cgpa={sr?.cgpa ?? 0}
          teamName={team?.name ?? null}
          teamStatus={team?.status ?? null}
          isLead={m?.is_lead ?? false}
          proposalCount={proposalList.length}
          approvedProposals={approvedProposals}
          pendingProposals={pendingProposals}
          totalMilestones={milestoneList.length}
          completedMilestones={completedMilestones}
          openMilestones={openMilestones}
          missedMilestones={missedMilestones}
          totalSubmissions={(submissions ?? []).length}
          upcomingDeadlines={upcoming}
        />
      </PageWrapper>
    </Shell>
  );
}
