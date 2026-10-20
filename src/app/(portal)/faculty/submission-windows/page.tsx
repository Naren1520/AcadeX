import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SubmissionWindowsClient } from "./SubmissionWindowsClient";
import { facultyNav } from "@/config/navigation";

export default async function SubmissionWindowsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: windows }, { data: milestones }] = await Promise.all([
    supabase.from("submission_windows").select("*, milestones(name)").eq("faculty_id", userId).order("opens_at", { ascending: false }),
    supabase.from("milestones").select("id, name").eq("faculty_id", userId).eq("status", "open"),
  ]);

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Submission Windows" }]} userFullName={fullName}>
      <PageWrapper title="Submission Windows" description="Control when students can upload artefacts.">
        <SubmissionWindowsClient
          windows={(windows ?? []) as Record<string, unknown>[]}
          milestones={(milestones ?? []) as { id: string; name: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}
