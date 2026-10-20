import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SubmissionsClient } from "./SubmissionsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentSubmissionsPage() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const { data: membership } = await supabase.from("team_members").select("team_id").eq("student_id", userId).maybeSingle();
  const teamId = membership?.team_id ?? null;

  const { data: proposals } = teamId
    ? await supabase.from("proposals").select("id").eq("team_id", teamId).eq("status", "approved")
    : { data: [] };
  const proposalIds = (proposals ?? []).map((p) => p.id);

  const { data: milestones } = proposalIds.length > 0
    ? await supabase.from("milestones").select("id, name, deadline, status").in("proposal_id", proposalIds).order("deadline")
    : { data: [] };
  const milestoneIds = (milestones ?? []).map((m) => m.id);

  const { data: windows } = milestoneIds.length > 0
    ? await supabase.from("submission_windows").select("*").in("milestone_id", milestoneIds)
    : { data: [] };
  const windowIds = (windows ?? []).map((w) => w.id);

  const { data: existing } = teamId && windowIds.length > 0
    ? await supabase.from("submissions").select("*").eq("team_id", teamId).in("window_id", windowIds)
    : { data: [] };

  return (
    <Shell role="student" navItems={studentNav} breadcrumbs={[{ label: "Student", href: "/student" }, { label: "Submissions" }]} userFullName={fullName}>
      <PageWrapper title="Submissions" description="Upload project artefacts within open submission windows.">
        <SubmissionsClient
          teamId={teamId}
          milestones={(milestones ?? []) as Record<string, unknown>[]}
          windows={(windows ?? []) as Record<string, unknown>[]}
          existingSubmissions={(existing ?? []) as Record<string, unknown>[]}
        />
      </PageWrapper>
    </Shell>
  );
}
