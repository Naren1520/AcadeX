import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { FacultySectionsClient } from "./FacultySectionsClient";

export type SectionWithPermission = {
  assignment_id: string;
  section_id: string;
  section_label: string;
  dept_name: string;
  dept_code: string;
  can_manage_students: boolean;
  student_count: number;
};

export type StudentInSection = {
  id: string;
  usn: string;
  full_name: string;
  email: string;
  cgpa: number;
};

export type StudentOption = {
  id: string;
  usn: string;
  full_name: string;
  email: string;
  cgpa: number;
  section_id: string | null;
};

export default async function FacultySectionsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const service = getSupabaseServiceRoleClient();

  // Get all assignments for this faculty with permission info
  const { data: assignments } = await service
    .from("faculty_assignments")
    .select("id, section_id, can_manage_students, sections(label, department_id, departments(name, code))")
    .eq("faculty_id", userId);

  type RawAssignment = {
    id: string;
    section_id: string;
    can_manage_students: boolean;
    sections: {
      label: string;
      department_id: string;
      departments: { name: string; code: string } | null;
    } | null;
  };

  const sectionIds = (assignments ?? []).map((a) => a.section_id);

  // Student counts per section
  const { data: students } = sectionIds.length > 0
    ? await service.from("students").select("id, section_id").in("section_id", sectionIds)
    : { data: [] };

  const countBySection: Record<string, number> = {};
  (students ?? []).forEach((s: { section_id: string | null }) => {
    if (s.section_id) countBySection[s.section_id] = (countBySection[s.section_id] ?? 0) + 1;
  });

  const sections: SectionWithPermission[] = (assignments as unknown as RawAssignment[] ?? []).map((a) => ({
    assignment_id:       a.id,
    section_id:          a.section_id,
    section_label:       a.sections?.label ?? "",
    dept_name:           a.sections?.departments?.name ?? "",
    dept_code:           a.sections?.departments?.code ?? "",
    can_manage_students: a.can_manage_students,
    student_count:       countBySection[a.section_id] ?? 0,
  }));

  // Students for manageable sections (for add dropdown)
  const manageableDeptIds = (assignments as unknown as RawAssignment[] ?? [])
    .filter((a) => a.can_manage_students)
    .map((a) => a.sections?.department_id)
    .filter(Boolean) as string[];

  const { data: allStudents } = manageableDeptIds.length > 0
    ? await service
        .from("students")
        .select("id, usn, cgpa, section_id, profiles(full_name, email)")
        .in("department_id", [...new Set(manageableDeptIds)])
        .order("usn")
    : { data: [] };

  type RS = { id: string; usn: string; cgpa: number; section_id: string | null; profiles: { full_name: string; email: string } | null };
  const studentOptions: StudentOption[] = (allStudents as unknown as RS[] ?? []).map((s) => ({
    id: s.id, usn: s.usn, cgpa: s.cgpa,
    full_name:  s.profiles?.full_name ?? "",
    email:      s.profiles?.email    ?? "",
    section_id: s.section_id,
  }));

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "My Sections" }]}
      userFullName={fullName}
    >
      <PageWrapper title="My Sections" description="Sections you are assigned to. Toggle shows student management access.">
        <FacultySectionsClient sections={sections} />
      </PageWrapper>
    </Shell>
  );
}
