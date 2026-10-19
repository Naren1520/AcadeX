import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/tables/DataTable";
import { redirect } from "next/navigation";
import { adminNav } from "@/config/navigation";
import Link from "next/link";

export default async function AdminStudentsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["admin"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: students } = await supabase
    .from("students")
    .select("id, usn, cgpa, profiles(full_name, email), departments(name, code)")
    .order("usn");

  type StudentRow = {
    id: string; usn: string; cgpa: number;
    profiles: { full_name: string; email: string } | null;
    departments: { name: string; code: string } | null;
  };

  const columns = [
    { key: "usn", header: "USN", sortable: true },
    { key: "full_name", header: "Name", render: (r: StudentRow) => r.profiles?.full_name ?? "â€”" },
    { key: "email", header: "Email", render: (r: StudentRow) => <span className="text-xs">{r.profiles?.email ?? "â€”"}</span> },
    { key: "department", header: "Department", render: (r: StudentRow) => r.departments?.code ?? "â€”" },
    { key: "cgpa", header: "CGPA", sortable: true, render: (r: StudentRow) => r.cgpa.toFixed(2) },
    { key: "actions", header: "", render: (r: StudentRow) => (
      <Link href={`/portal/admin/students/${r.id}`} className="text-xs" style={{ color: "#1e3a5f" }}>Manage â†’</Link>
    )},
  ];

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/portal/admin" }, { label: "Students" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Students" description="All registered students.">
        <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
          <DataTable
            columns={columns}
            data={(students ?? []) as unknown as StudentRow[]}
            emptyMessage="No students found."
            caption="All students"
          />
        </div>
      </PageWrapper>
    </Shell>
  );
}

