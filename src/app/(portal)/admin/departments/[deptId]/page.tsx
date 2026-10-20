import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { DeptAcademicYearsClient } from "./DeptAcademicYearsClient";

export type AcademicYear = {
  id: string;
  label: string;
  is_closed: boolean;
  created_at: string;
};

export default async function DeptAcademicYearsPage({
  params,
}: {
  params: Promise<{ deptId: string }>;
}) {
  const { deptId } = await params;
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  // Verify department exists
  const { data: dept } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("id", deptId)
    .single();

  if (!dept) notFound();

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .order("label", { ascending: false });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[
        { label: "Admin",       href: "/admin" },
        { label: "Departments", href: "/admin/departments" },
        { label: `${dept.name} (${dept.code})` },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title={`${dept.name} (${dept.code})`}
        description="Manage academic years for this department. Click a year to manage its semesters and sections."
      >
        <DeptAcademicYearsClient
          deptId={deptId}
          deptCode={dept.code}
          initialYears={(years ?? []) as AcademicYear[]}
        />
      </PageWrapper>
    </Shell>
  );
}
