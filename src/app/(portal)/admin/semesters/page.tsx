import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { SemestersClient } from "./SemestersClient";

export type Semester = {
  id: string;
  academic_year_id: string;
  label: string;
  is_closed: boolean;
  created_at: string;
  academic_years: { label: string } | null;
};

export type AcademicYearOption = { id: string; label: string; is_closed: boolean };

export default async function SemestersPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: semesters }, { data: years }] = await Promise.all([
    supabase.from("semesters").select("*, academic_years(label)").order("label"),
    supabase.from("academic_years").select("id, label, is_closed").eq("is_closed", false).order("label", { ascending: false }),
  ]);

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Semesters" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Semesters" description="Manage semesters within academic years.">
        <SemestersClient
          initialSemesters={(semesters ?? []) as unknown as Semester[]}
          academicYears={(years ?? []) as AcademicYearOption[]}
        />
      </PageWrapper>
    </Shell>
  );
}
