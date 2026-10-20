import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { IconArrowRight } from "@/components/ui/Icon";
import { facultyNav } from "@/config/navigation";

export default async function FacultyDashboard() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const service = getSupabaseServiceRoleClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single() as { data: { role: string; full_name: string } | null };

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "student") redirect("/student");
  if (profile.role !== "faculty") redirect("/login");

  const [{ count: pendingProposals }, { count: assignmentCount }] = await Promise.all([
    service
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("faculty_id", userId)
      .eq("status", "pending"),
    service
      .from("faculty_assignments")
      .select("id", { count: "exact", head: true })
      .eq("faculty_id", userId),
  ]);

  const stats = [
    { label: "Pending Proposals", value: pendingProposals ?? 0 },
    { label: "Section Assignments", value: assignmentCount ?? 0 },
  ];

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty" }, { label: "Dashboard" }]}
      userFullName={profile.full_name}
    >
      <PageWrapper
        title="Faculty Dashboard"
        description="Review proposals, manage teams, and track milestones."
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Review Pending Proposals", href: "/faculty/proposals" },
              { label: "Manage Team Formation Rules", href: "/faculty/team-formation" },
              { label: "Create Milestones", href: "/faculty/milestones" },
              { label: "Open Submission Window", href: "/faculty/submission-windows" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded p-4 text-sm font-medium text-neutral-900 transition-colors"
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
