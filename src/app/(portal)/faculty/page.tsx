import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { IconArrowRight } from "@/components/ui/Icon";
import { getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { facultyNav } from "@/config/navigation";

export default async function FacultyDashboard() {
  const supabase = await getSupabaseServerClient();

  try {
    await requireRole(supabase, ["faculty"]);
  } catch {
    redirect("/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const [{ count: pendingProposals }, { count: teamCount }] = await Promise.all([
    supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("faculty_id", user!.id)
      .eq("status", "pending"),
    supabase
      .from("faculty_assignments")
      .select("id", { count: "exact", head: true })
      .eq("faculty_id", user!.id),
  ]);

  const stats = [
    { label: "Pending Proposals", value: pendingProposals ?? 0 },
    { label: "Section Assignments", value: teamCount ?? 0 },
  ];

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty" }, { label: "Dashboard" }]}
      userFullName={profile?.full_name}
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
                <p
                  className="mt-1 text-3xl font-bold"
                  style={{ color: "#1e3a5f" }}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Review Pending Proposals", href: "/portal/faculty/proposals" },
              { label: "Manage Team Formation Rules", href: "/portal/faculty/team-formation" },
              { label: "Create Milestones", href: "/portal/faculty/milestones" },
              { label: "Open Submission Window", href: "/portal/faculty/submission-windows" },
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
