import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FacultyMilestonesClient } from "./FacultyMilestonesClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyMilestonesPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: milestones }, { data: proposals }] = await Promise.all([
    supabase.from("milestones").select("*, proposals(title, team_id)").eq("faculty_id", userId).order("deadline", { ascending: true }),
    supabase.from("proposals").select("id, title").eq("faculty_id", userId).eq("status", "approved"),
  ]);

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Milestones" }]} userFullName={fullName}>
      <PageWrapper title="Milestones" description="Create and manage project milestones.">
        <FacultyMilestonesClient
          milestones={(milestones ?? []) as Record<string, unknown>[]}
          proposals={(proposals ?? []) as { id: string; title: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}
