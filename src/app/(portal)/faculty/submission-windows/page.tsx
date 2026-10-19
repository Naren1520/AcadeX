import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { SubmissionWindowsClient } from "./SubmissionWindowsClient";
import { facultyNav } from "@/config/navigation";

export default async function SubmissionWindowsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["faculty"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: windows } = await supabase
    .from("submission_windows")
    .select("*, milestones(name)")
    .eq("faculty_id", user!.id)
    .order("opens_at", { ascending: false });

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, name")
    .eq("faculty_id", user!.id)
    .eq("status", "open");

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/portal/faculty" }, { label: "Submission Windows" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Submission Windows" description="Control when students can upload artefacts.">
        <SubmissionWindowsClient
          windows={(windows ?? []) as Record<string, unknown>[]}
          milestones={(milestones ?? []) as { id: string; name: string }[]}
        />
      </PageWrapper>
    </Shell>
  );
}


