import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { getUserProfile } from "@/lib/supabase/helpers";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { IconArrowRight } from "@/components/ui/Icon";
import { adminNav } from "@/config/navigation";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["admin"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const [{ count: deptCount }, { count: studentCount }, { count: facultyCount }] =
    await Promise.all([
      supabase.from("departments").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "faculty"),
    ]);

  const stats = [
    { label: "Active Departments", value: deptCount ?? 0 },
    { label: "Students", value: studentCount ?? 0 },
    { label: "Faculty", value: facultyCount ?? 0 },
  ];

  const quickActions = [
    { label: "Manage Departments", href: "/portal/admin/departments" },
    { label: "Manage Academic Years", href: "/portal/admin/academic-years" },
    { label: "Assign Faculty", href: "/portal/admin/faculty-assignments" },
    { label: "View Audit Logs", href: "/portal/admin/audit-logs" },
  ];

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper
        title="Admin Dashboard"
        description="Manage the platform's academic structure and settings."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: "#1e3a5f" }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded p-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
              >
                {action.label}
                <IconArrowRight size={16} style={{ color: "#1e3a5f", flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      </PageWrapper>
    </Shell>
  );
}
