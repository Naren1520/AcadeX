import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { TeamsClient } from "./TeamsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentTeamsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["student"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);
  const { data: student } = await supabase.from("students").select("cgpa, section_id").eq("id", user!.id).single();

  // Current team membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, is_lead, teams(id, name, status, rule_id, team_formation_rules(cgpa_lower, cgpa_upper, min_team_size, max_team_size))")
    .eq("student_id", user!.id)
    .maybeSingle();

  // Available teams in the student's section
  const { data: sectionTeams } = student?.section_id
    ? await supabase
        .from("teams")
        .select("id, name, status, rule_id, team_formation_rules(cgpa_lower, cgpa_upper, min_team_size, max_team_size)")
        .eq("section_id", student.section_id)
        .eq("status", "forming")
    : { data: [] };

  // Available rules for forming a new team
  const { data: rules } = student?.section_id
    ? await supabase
        .from("team_formation_rules")
        .select("*")
        .eq("section_id", student.section_id)
        .eq("is_enabled", true)
    : { data: [] };

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student", href: "/portal/student" }, { label: "My Team" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Team Formation" description="Join an existing team or form a new one.">
        <TeamsClient
          studentId={user!.id}
          studentCgpa={student?.cgpa ?? 0}
          sectionId={student?.section_id ?? null}
          currentMembership={membership as Record<string, unknown> | null}
          sectionTeams={(sectionTeams ?? []) as Record<string, unknown>[]}
          rules={(rules ?? []) as Record<string, unknown>[]}
        />
      </PageWrapper>
    </Shell>
  );
}


