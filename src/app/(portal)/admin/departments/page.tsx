import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { DepartmentsClient } from "./DepartmentsClient";
import { adminNav } from "@/config/navigation";

export default async function DepartmentsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["admin"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);
  const { data: departments } = await supabase.from("departments").select("*").order("name");

  return (
    <Shell role="admin" navItems={adminNav} breadcrumbs={[{ label: "Admin", href: "/portal/admin" }, { label: "Departments" }]} userFullName={profile?.full_name}>
      <PageWrapper title="Departments" description="Manage academic departments.">
        <DepartmentsClient initialDepartments={departments ?? []} />
      </PageWrapper>
    </Shell>
  );
}

