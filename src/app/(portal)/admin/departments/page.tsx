import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DepartmentsClient } from "./DepartmentsClient";
import { adminNav } from "@/config/navigation";

export default async function DepartmentsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const { data: departments } = await supabase.from("departments").select("*").order("name");

  return (
    <Shell role="admin" navItems={adminNav} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Departments" }]} userFullName={fullName}>
      <PageWrapper title="Departments" description="Manage academic departments.">
        <DepartmentsClient initialDepartments={departments ?? []} />
      </PageWrapper>
    </Shell>
  );
}
