import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StudentProposalsClient } from "./StudentProposalsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentProposalsPage() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const supabase = await getSupabaseServerClient();
  const service = getSupabaseServiceRoleClient();

  const { data: membership } = await supabase
    .from("team_members").select("team_id, is_lead, teams(status)").eq("student_id", userId).maybeSingle();
  const teamId = membership?.team_id ?? null;

  const [{ data: proposals }, { data: facultyList }] = await Promise.all([
    teamId
      ? supabase.from("proposals").select("*, proposal_sdgs(sdg_number)").eq("team_id", teamId).order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    service.from("profiles").select("id, full_name").eq("role", "faculty"),
  ]);

  return (
    <Shell role="student" navItems={studentNav} breadcrumbs={[{ label: "Student", href: "/student" }, { label: "Proposals" }]} userFullName={fullName}>
      <PageWrapper title="Proposals" description="Submit and track your project proposals.">
        <StudentProposalsClient
          teamId={teamId}
          teamStatus={(membership as { teams?: { status: string } } | null)?.teams?.status ?? null}
          proposals={(proposals ?? []) as Record<string, unknown>[]}
          facultyList={(facultyList ?? []) as { id: string; full_name: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}
