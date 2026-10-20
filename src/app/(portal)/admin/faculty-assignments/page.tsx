import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { FacultyAssignmentsClient } from "./FacultyAssignmentsClient";

export type Assignment = {
  id: string;
  faculty_id: string;
  section_id: string;
  department_id: string;
  assigned_at: string;
  profiles:     { full_name: string; email: string } | null;
  sections:     { label: string } | null;
  departments:  { name: string; code: string } | null;
};

export type FacultyOption     = { id: string; full_name: string; email: string };
export type SectionOption     = { id: string; label: string; department_id: string; dept_code: string; semester_label: string };
export type DepartmentOption  = { id: string; name: string; code: string };

export default async function FacultyAssignmentsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  // use service role so RLS doesn't restrict reading profiles
  const service = getSupabaseServiceRoleClient();

  const [
    { data: assignments },
    { data: faculty },
    { data: sections },
    { data: departments },
  ] = await Promise.all([
    service
      .from("faculty_assignments")
      .select("*, profiles(full_name, email), sections(label), departments(name, code)")
      .order("assigned_at", { ascending: false }),
    service
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "faculty")
      .order("full_name"),
    service
      .from("sections")
      .select("id, label, department_id, departments(code), semesters(label)")
      .order("label"),
    service
      .from("departments")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name"),
  ]);

  const sectionOptions: SectionOption[] = (sections ?? []).map((s: unknown) => {
    const row = s as { id: string; label: string; department_id: string; departments: { code: string } | null; semesters: { label: string } | null };
    return {
      id:             row.id,
      label:          row.label,
      department_id:  row.department_id,
      dept_code:      row.departments?.code ?? "",
      semester_label: row.semesters?.label  ?? "",
    };
  });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Faculty Assignments" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Faculty Assignments" description="Assign faculty members to sections.">
        <FacultyAssignmentsClient
          initialAssignments={(assignments ?? []) as unknown as Assignment[]}
          faculty={(faculty ?? []) as FacultyOption[]}
          sections={sectionOptions}
          departments={(departments ?? []) as DepartmentOption[]}
        />
      </PageWrapper>
    </Shell>
  );
}
