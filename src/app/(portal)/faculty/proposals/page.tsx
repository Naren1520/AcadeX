import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { FacultyProposalsClient } from "./FacultyProposalsClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyProposalsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["faculty"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, proposal_sdgs(sdg_number), teams(name)")
    .eq("faculty_id", user!.id)
    .order("submitted_at", { ascending: false });

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/portal/faculty" }, { label: "Proposals" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Proposals" description="Review, approve, reject, or request revisions.">
        <FacultyProposalsClient proposals={(proposals ?? []) as Record<string, unknown>[]} />
      </PageWrapper>
    </Shell>
  );
}


