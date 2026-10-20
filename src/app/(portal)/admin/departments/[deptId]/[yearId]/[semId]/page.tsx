import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { SectionsClient } from "./SectionsClient";

export type Section = {
  id: string;
  label: string;
  student_count: number;
  faculty_count: number;
};

export default async function SemesterSectionsPage({
  params,
}: {
  params: Promise<{ deptId: string; yearId: string; semId: string }>;
}) {
  const { deptId, yearId, semId } = await params;
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = getSupabaseServiceRoleClient();

  const [{ data: dept }, { data: year }, { data: sem }] = await Promise.all([
    supabase.from("departments").select("id, name, code").eq("id", deptId).single(),
    supabase.from("academic_years").select("id, label").eq("id", yearId).single(),
    supabase.from("semesters").select("id, label, is_closed").eq("id", semId).single(),
  ]);

  if (!dept || !year || !sem) notFound();

  const { data: rawSections } = await supabase
    .from("sections")
    .select("id, label")
    .eq("department_id", deptId)
    .eq("semester_id", semId)
    .order("label");

  const sectionIds = (rawSections ?? []).map((s) => s.id);

  const [{ data: students }, { data: assignments }] = await Promise.all([
    sectionIds.length > 0
      ? supabase.from("students").select("id, section_id").in("section_id", sectionIds)
      : Promise.resolve({ data: [] }),
    sectionIds.length > 0
      ? supabase.from("faculty_assignments").select("id, section_id").in("section_id", sectionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const studentCount: Record<string, number> = {};
  const facultyCount: Record<string, number> = {};
  (students ?? []).forEach((s: { section_id: string }) => {
    studentCount[s.section_id] = (studentCount[s.section_id] ?? 0) + 1;
  });
  (assignments ?? []).forEach((a: { section_id: string }) => {
    facultyCount[a.section_id] = (facultyCount[a.section_id] ?? 0) + 1;
  });

  const sections: Section[] = (rawSections ?? []).map((s) => ({
    id:            s.id,
    label:         s.label,
    student_count: studentCount[s.id] ?? 0,
    faculty_count: facultyCount[s.id] ?? 0,
  }));

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[
        { label: "Admin",       href: "/admin" },
        { label: "Departments", href: "/admin/departments" },
        { label: `${dept.name} (${dept.code})`, href: `/admin/departments/${deptId}` },
        { label: year.label, href: `/admin/departments/${deptId}/${yearId}` },
        { label: sem.label },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title={sem.label}
        description={`Sections for ${dept.name}. Click a section to manage students and faculty.`}
      >
        <SectionsClient
          deptId={deptId}
          deptCode={dept.code}
          yearId={yearId}
          semId={semId}
          semLabel={sem.label}
          isClosed={sem.is_closed}
          initialSections={sections}
        />
      </PageWrapper>
    </Shell>
  );
}
