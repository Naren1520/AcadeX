import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { TeamFormationRulesClient } from "./TeamFormationRulesClient";
import type { NavItem } from "@/components/layout/Sidebar";
import { facultyNav } from "@/config/navigation";

export default async function FacultyTeamFormationPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["faculty"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: rules } = await supabase
    .from("team_formation_rules")
    .select("*, sections(label, departments(name))")
    .eq("faculty_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: assignments } = await supabase
    .from("faculty_assignments")
    .select("section_id, sections(id, label, departments(name))")
    .eq("faculty_id", user!.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections = (assignments ?? []).map((a: any) => ({
    id: String(a?.sections?.id ?? a.section_id ?? ""),
    label: String(a?.sections?.label ?? ""),
    department: String(a?.sections?.departments?.name ?? ""),
  }));

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/portal/faculty" }, { label: "Team Formation Rules" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Team Formation Rules" description="Configure CGPA-based rules for team eligibility.">
        <TeamFormationRulesClient
          initialRules={(rules ?? []) as Record<string, unknown>[]}
          sections={sections}
        />
      </PageWrapper>
    </Shell>
  );
}

