import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FacultyProposalsClient } from "./FacultyProposalsClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyProposalsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const { data: proposals } = await supabase
    .from("proposals").select("*, proposal_sdgs(sdg_number), teams(name)")
    .eq("faculty_id", userId).order("submitted_at", { ascending: false });

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Proposals" }]} userFullName={fullName}>
      <PageWrapper title="Proposals" description="Review, approve, reject, or request revisions.">
        <FacultyProposalsClient proposals={(proposals ?? []) as Record<string, unknown>[]} />
      </PageWrapper>
    </Shell>
  );
}
