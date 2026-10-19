import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { StudentProposalsClient } from "./StudentProposalsClient";
import { studentNav } from "@/config/navigation";

export default async function StudentProposalsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["student"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, is_lead, teams(status)")
    .eq("student_id", user!.id)
    .maybeSingle();

  const teamId = membership?.team_id ?? null;

  const { data: proposals } = teamId
    ? await supabase
        .from("proposals")
        .select("*, proposal_sdgs(sdg_number)")
        .eq("team_id", teamId)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  const { data: facultyList } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "faculty");

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student", href: "/portal/student" }, { label: "Proposals" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Proposals" description="Submit and track your project proposals.">
        <StudentProposalsClient
          teamId={teamId}
          teamStatus={(membership as { teams?: { status: string } } | null)?.teams?.status ?? null}
          proposals={(proposals ?? []) as Record<string, unknown>[]}
          facultyList={(facultyList ?? []) as { id: string; full_name: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}


