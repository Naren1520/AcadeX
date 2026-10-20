import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { StudentsTable, type StudentRow } from "./StudentsTable";

export default async function FacultyStudentsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const { data: assignmentsData } = await supabase
    .from("faculty_assignments").select("department_id").eq("faculty_id", userId);
  const deptIds = [...new Set((assignmentsData ?? []).map((a) => a.department_id))];

  const { data: students } = deptIds.length > 0
    ? await supabase.from("students")
        .select("id, usn, cgpa, github_url, profiles(full_name, email), departments(name)")
        .in("department_id", deptIds).order("usn")
    : { data: [] };

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Students" }]} userFullName={fullName}>
      <PageWrapper title="Students" description="Students in your assigned departments.">
        <StudentsTable students={(students ?? []) as unknown as StudentRow[]} />
      </PageWrapper>
    </Shell>
  );
}
