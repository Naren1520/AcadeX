import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TeamsClient } from "./TeamsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentTeamsPage() {
  const { userId, fullName } = await requirePageRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: student }, { data: membership }] = await Promise.all([
    supabase.from("students").select("cgpa, section_id").eq("id", userId).single(),
    supabase.from("team_members")
      .select("team_id, is_lead, teams(id, name, status, rule_id, team_formation_rules(cgpa_lower, cgpa_upper, min_team_size, max_team_size))")
      .eq("student_id", userId).maybeSingle(),
  ]);

  const [{ data: sectionTeams }, { data: rules }] = await Promise.all([
    student?.section_id
      ? supabase.from("teams")
          .select("id, name, status, rule_id, team_formation_rules(cgpa_lower, cgpa_upper, min_team_size, max_team_size)")
          .eq("section_id", student.section_id).eq("status", "forming")
      : Promise.resolve({ data: [] }),
    student?.section_id
      ? supabase.from("team_formation_rules").select("*").eq("section_id", student.section_id).eq("is_enabled", true)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <Shell role="student" navItems={studentNav} breadcrumbs={[{ label: "Student", href: "/student" }, { label: "My Team" }]} userFullName={fullName}>
      <PageWrapper title="Team Formation" description="Join an existing team or form a new one.">
        <TeamsClient
          studentId={userId}
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
