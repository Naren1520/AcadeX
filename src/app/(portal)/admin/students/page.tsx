import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { StudentsTable, type StudentRow, type SectionOption } from "./StudentsTable";

export default async function AdminStudentsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const service = getSupabaseServiceRoleClient();

  const [{ data: students }, { data: sections }] = await Promise.all([
    service
      .from("students")
      .select("id, usn, cgpa, section_id, profiles(full_name, email), departments(name, code), sections(label)")
      .order("usn"),
    service
      .from("sections")
      .select("id, label, department_id, departments(code), semesters(label)")
      .order("label"),
  ]);

  const sectionOptions: SectionOption[] = (sections ?? []).map((s: unknown) => {
    const row = s as { id: string; label: string; department_id: string; departments: { code: string } | null; semesters: { label: string } | null };
    return {
      id:             row.id,
      label:          row.label,
      dept_code:      row.departments?.code ?? "",
      semester_label: row.semesters?.label  ?? "",
    };
  });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Students" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Students" description="Manage students and their section assignments.">
        <StudentsTable
          students={(students ?? []) as unknown as StudentRow[]}
          sections={sectionOptions}
        />
      </PageWrapper>
    </Shell>
  );
}
