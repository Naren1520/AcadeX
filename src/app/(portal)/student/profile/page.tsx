import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { StudentProfileClient } from "./StudentProfileClient";
import { studentNav } from "@/config/navigation";

export default async function StudentProfilePage() {
  const { userId, fullName, email } = await requirePageRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const { data: student } = await supabase.from("students").select("*").eq("id", userId).single();

  return (
    <Shell role="student" navItems={studentNav} breadcrumbs={[{ label: "Student", href: "/student" }, { label: "Profile" }]} userFullName={fullName}>
      <PageWrapper title="My Profile" description="Manage your skills, GitHub profile, and resume.">
        <StudentProfileClient
          studentId={userId}
          fullName={fullName}
          email={email}
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
