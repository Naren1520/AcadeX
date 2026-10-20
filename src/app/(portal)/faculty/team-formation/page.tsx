import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TeamFormationRulesClient } from "./TeamFormationRulesClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyTeamFormationPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: rules }, { data: assignments }] = await Promise.all([
    supabase.from("team_formation_rules").select("*, sections(label, departments(name))").eq("faculty_id", userId).order("created_at", { ascending: false }),
    supabase.from("faculty_assignments").select("section_id, sections(id, label, departments(name))").eq("faculty_id", userId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections = (assignments ?? []).map((a: any) => ({
    id: String(a?.sections?.id ?? a.section_id ?? ""),
    label: String(a?.sections?.label ?? ""),
    department: String(a?.sections?.departments?.name ?? ""),
  }));

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Team Formation Rules" }]} userFullName={fullName}>
      <PageWrapper title="Team Formation Rules" description="Configure CGPA-based rules for team eligibility.">
        <TeamFormationRulesClient initialRules={(rules ?? []) as Record<string, unknown>[]} sections={sections} />
      </PageWrapper>
    </Shell>
  );
}
