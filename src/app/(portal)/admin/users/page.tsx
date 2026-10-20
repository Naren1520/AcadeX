import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { UsersClient } from "./UsersClient";

export type UserRow = {
  id: string;
  role: "faculty" | "student";
  full_name: string;
  email: string;
  created_at: string;
};

export default async function AdminUsersPage() {
  const { fullName } = await requirePageRole(["admin"]);
  const service = getSupabaseServiceRoleClient();

  const { data: users } = await service
    .from("profiles")
    .select("id, role, full_name, email, created_at")
    .in("role", ["faculty", "student"])
    .order("created_at", { ascending: false });

  // Fetch departments for the student creation form
  const { data: departments } = await service
    .from("departments")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  // Fetch sections for the student creation form
  const { data: sections } = await service
    .from("sections")
    .select("id, label, department_id, semesters(label, academic_years(label))")
    .order("label");

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      userFullName={fullName}
    >
      <PageWrapper title="Users" description="Create and manage faculty and student accounts.">
        <UsersClient
          initialUsers={(users ?? []) as UserRow[]}
          departments={departments ?? []}
          sections={(sections ?? []) as unknown as SectionOption[]}
        />
      </PageWrapper>
    </Shell>
  );
}

export type DepartmentOption = { id: string; name: string; code: string };
export type SectionOption = {
  id: string;
  label: string;
  department_id: string;
  semesters: { label: string; academic_years: { label: string } } | null;
};
