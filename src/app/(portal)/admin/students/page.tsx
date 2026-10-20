import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { StudentsTable, type StudentRow } from "./StudentsTable";

export default async function AdminStudentsPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const service = getSupabaseServiceRoleClient();

  const { data: students } = await service
    .from("students").select("id, usn, cgpa, profiles(full_name, email), departments(name, code)").order("usn");

  return (
    <Shell role="admin" navItems={adminNav} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Students" }]} userFullName={fullName}>
      <PageWrapper title="Students" description="All registered students.">
        <StudentsTable students={(students ?? []) as unknown as StudentRow[]} />
      </PageWrapper>
    </Shell>
  );
}
