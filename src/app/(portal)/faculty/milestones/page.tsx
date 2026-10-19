import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { FacultyMilestonesClient } from "./FacultyMilestonesClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyMilestonesPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["faculty"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*, proposals(title, team_id)")
    .eq("faculty_id", user!.id)
    .order("deadline", { ascending: true });

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title")
    .eq("faculty_id", user!.id)
    .eq("status", "approved");

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/portal/faculty" }, { label: "Milestones" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Milestones" description="Create and manage project milestones.">
        <FacultyMilestonesClient
          milestones={(milestones ?? []) as Record<string, unknown>[]}
          proposals={(proposals ?? []) as { id: string; title: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}


