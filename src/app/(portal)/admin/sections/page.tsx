import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { SectionsClient } from "./SectionsClient";

export type Section = {
  id: string;
  semester_id: string;
  department_id: string;
  label: string;
  created_at: string;
  semesters: { label: string; is_closed: boolean } | null;
  departments: { name: string; code: string } | null;
};

export type SemesterOption  = { id: string; label: string; academic_year_label: string };
export type DepartmentOption = { id: string; name: string; code: string };

export default async function SectionsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: sections }, { data: semesters }, { data: departments }] = await Promise.all([
    supabase
      .from("sections")
      .select("*, semesters(label, is_closed), departments(name, code)")
      .order("label"),
    supabase
      .from("semesters")
      .select("id, label, is_closed, academic_years(label)")
      .eq("is_closed", false)
      .order("label"),
    supabase
      .from("departments")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name"),
  ]);

  const semesterOptions: SemesterOption[] = (semesters ?? []).map((s: {
    id: string; label: string; academic_years: { label: string } | null
  }) => ({
    id: s.id,
    label: s.label,
    academic_year_label: s.academic_years?.label ?? "",
  }));

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Sections" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Sections" description="Manage sections within semesters.">
        <SectionsClient
          initialSections={(sections ?? []) as unknown as Section[]}
          semesters={semesterOptions}
          departments={(departments ?? []) as DepartmentOption[]}
        />
      </PageWrapper>
    </Shell>
  );
}
