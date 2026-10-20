import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { EmptyState } from "@/components/feedback/Skeleton";
import { studentNav } from "@/config/navigation";
import { MilestoneTimeline } from "./MilestoneTimeline";

export default async function StudentMilestonesPage() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const { data: membership } = await supabase.from("team_members").select("team_id").eq("student_id", userId).maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamId = (membership as any)?.team_id as string | undefined;

  const { data: proposals } = teamId
    ? await supabase.from("proposals").select("id").eq("team_id", teamId).eq("status", "approved")
    : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposalIds: string[] = (proposals ?? []).map((p: any) => p.id as string);

  const { data: milestones } = proposalIds.length > 0
    ? await supabase.from("milestones").select("*").in("proposal_id", proposalIds).order("deadline", { ascending: true })
    : { data: [] };

  return (
    <Shell role="student" navItems={studentNav} breadcrumbs={[{ label: "Student", href: "/student" }, { label: "Milestones" }]} userFullName={fullName}>
      <PageWrapper title="Milestones" description="Track your project milestones and deadlines.">
        {(milestones ?? []).length === 0 ? (
          <EmptyState title="No milestones yet" description="Milestones will appear here once your proposal is approved." />
        ) : (
          <MilestoneTimeline milestones={milestones ?? []} />
        )}
      </PageWrapper>
    </Shell>
  );
}
