import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { SemestersClient } from "./SemestersClient";

export type Semester = {
  id: string;
  label: string;
  is_closed: boolean;
  section_count: number;
};

export default async function YearSemestersPage({
  params,
}: {
  params: Promise<{ deptId: string; yearId: string }>;
}) {
  const { deptId, yearId } = await params;
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = getSupabaseServiceRoleClient();

  const [{ data: dept }, { data: year }] = await Promise.all([
    supabase.from("departments").select("id, name, code").eq("id", deptId).single(),
    supabase.from("academic_years").select("id, label").eq("id", yearId).single(),
  ]);

  if (!dept || !year) notFound();

  const { data: allSemesters } = await supabase
    .from("semesters")
    .select("id, label, is_closed")
    .eq("academic_year_id", yearId)
    .order("label");

  // Count sections per semester for this dept
  const semIds = (allSemesters ?? []).map((s) => s.id);
  const { data: sections } = semIds.length > 0
    ? await supabase
        .from("sections")
        .select("id, semester_id")
        .eq("department_id", deptId)
        .in("semester_id", semIds)
    : { data: [] };

  const countBySem: Record<string, number> = {};
  (sections ?? []).forEach((s: { semester_id: string }) => {
    countBySem[s.semester_id] = (countBySem[s.semester_id] ?? 0) + 1;
  });

  const semesters: Semester[] = (allSemesters ?? []).map((s) => ({
    ...s,
    section_count: countBySem[s.id] ?? 0,
  }));

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[
        { label: "Admin",       href: "/admin" },
        { label: "Departments", href: "/admin/departments" },
        { label: `${dept.name} (${dept.code})`, href: `/admin/departments/${deptId}` },
        { label: year.label },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title={year.label}
        description={`Semesters for ${dept.name}. Click a semester to manage its sections.`}
      >
        <SemestersClient
          deptId={deptId}
          deptCode={dept.code}
          yearId={yearId}
          initialSemesters={semesters}
        />
      </PageWrapper>
    </Shell>
  );
}
