import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { StudentProfileClient } from "./StudentProfileClient";
import { studentNav } from "@/config/navigation";

export default async function StudentProfilePage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["student"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);
  const { data: student } = await supabase.from("students").select("*").eq("id", user!.id).single();

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student", href: "/portal/student" }, { label: "Profile" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="My Profile" description="Manage your skills, GitHub profile, and resume.">
        <StudentProfileClient
          studentId={user!.id}
          fullName={profile?.full_name ?? ""}
          email={profile?.email ?? ""}
          usn={student?.usn ?? ""}
          cgpa={student?.cgpa ?? 0}
          initialSkills={student?.skills ?? []}
          initialGithubUrl={student?.github_url ?? ""}
          resumePath={student?.resume_path ?? null}
        />
      </PageWrapper>
    </Shell>
  );
}

