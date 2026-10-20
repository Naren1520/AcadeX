import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { SectionDetailClient } from "./SectionDetailClient";

export type StudentInSection = {
  id: string;
  usn: string;
  full_name: string;
  email: string;
  cgpa: number;
};

export type FacultyInSection = {
  assignment_id: string;
  faculty_id: string;
  full_name: string;
  email: string;
};

export type StudentOption = {
  id: string;
  usn: string;
  full_name: string;
  email: string;
  cgpa: number;
  section_id: string | null;
};

export type FacultyOption = {
  id: string;
  full_name: string;
  email: string;
};

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ deptId: string; yearId: string; semId: string; sectionId: string }>;
}) {
  const { deptId, yearId, semId, sectionId } = await params;
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = getSupabaseServiceRoleClient();

  const [
    { data: dept },
    { data: year },
    { data: sem },
    { data: section },
  ] = await Promise.all([
    supabase.from("departments").select("id, name, code").eq("id", deptId).single(),
    supabase.from("academic_years").select("id, label").eq("id", yearId).single(),
    supabase.from("semesters").select("id, label, is_closed").eq("id", semId).single(),
    supabase.from("sections").select("id, label").eq("id", sectionId).single(),
  ]);

  if (!dept || !year || !sem || !section) notFound();

  // Students in this section
  const { data: rawStudents } = await supabase
    .from("students")
    .select("id, usn, cgpa, profiles(full_name, email)")
    .eq("section_id", sectionId)
    .order("usn");

  // Faculty assigned to this section
  const { data: rawAssignments } = await supabase
    .from("faculty_assignments")
    .select("id, faculty_id, profiles(full_name, email)")
    .eq("section_id", sectionId);

  // All students in this dept (for add dropdown)
  const { data: allDeptStudents } = await supabase
    .from("students")
    .select("id, usn, cgpa, section_id, profiles(full_name, email)")
    .eq("department_id", deptId)
    .order("usn");

  // All faculty (for assign dropdown)
  const { data: allFaculty } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "faculty")
    .order("full_name");

  type R = { id: string; usn: string; cgpa: number; section_id: string | null; profiles: { full_name: string; email: string } | null };
  type A = { id: string; faculty_id: string; profiles: { full_name: string; email: string } | null };

  const students: StudentInSection[] = (rawStudents as unknown as R[] ?? []).map((s) => ({
    id: s.id, usn: s.usn, cgpa: s.cgpa,
    full_name: s.profiles?.full_name ?? "",
    email:     s.profiles?.email    ?? "",
  }));

  const faculty: FacultyInSection[] = (rawAssignments as unknown as A[] ?? []).map((a) => ({
    assignment_id: a.id,
    faculty_id:    a.faculty_id,
    full_name:     a.profiles?.full_name ?? "",
    email:         a.profiles?.email    ?? "",
  }));

  const studentOptions: StudentOption[] = (allDeptStudents as unknown as R[] ?? []).map((s) => ({
    id: s.id, usn: s.usn, cgpa: s.cgpa,
    full_name:  s.profiles?.full_name ?? "",
    email:      s.profiles?.email    ?? "",
    section_id: s.section_id,
  }));

  const facultyOptions: FacultyOption[] = (allFaculty ?? []).map((f: { id: string; full_name: string; email: string }) => ({
    id: f.id, full_name: f.full_name, email: f.email,
  }));

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[
        { label: "Admin",       href: "/admin" },
        { label: "Departments", href: "/admin/departments" },
        { label: `${dept.name} (${dept.code})`, href: `/admin/departments/${deptId}` },
        { label: year.label,    href: `/admin/departments/${deptId}/${yearId}` },
        { label: sem.label,     href: `/admin/departments/${deptId}/${yearId}/${semId}` },
        { label: section.label },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title={`Section ${section.label}`}
        description={`${dept.name} · ${sem.label} · ${year.label}`}
      >
        <SectionDetailClient
          sectionId={sectionId}
          sectionLabel={section.label}
          deptId={deptId}
          deptCode={dept.code}
          isClosed={sem.is_closed}
          initialStudents={students}
          initialFaculty={faculty}
          studentOptions={studentOptions}
          facultyOptions={facultyOptions}
        />
      </PageWrapper>
    </Shell>
  );
}
