import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { AcademicYearsClient } from "./AcademicYearsClient";

export type AcademicYear = {
  id: string;
  label: string;
  is_closed: boolean;
  created_at: string;
};

export default async function AcademicYearsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .order("label", { ascending: false });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Academic Years" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Academic Years" description="Manage academic years.">
        <AcademicYearsClient initialYears={(years ?? []) as AcademicYear[]} />
      </PageWrapper>
    </Shell>
  );
}
