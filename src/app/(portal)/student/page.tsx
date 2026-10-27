import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconArrowRight } from "@/components/ui/Icon";
import { studentNav } from "@/config/navigation";

export default async function StudentDashboard() {
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
  if (profile.role === "faculty") redirect("/faculty");
  if (profile.role !== "student") redirect("/login");

  const [{ data: studentRecord }, { data: teamMembership }] = await Promise.all([
    service.from("students").select("cgpa, usn").eq("id", userId).single(),
    service
      .from("team_members")
      .select("team_id, is_lead, teams(name, status)")
      .eq("student_id", userId)
      .maybeSingle(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membershipAny = teamMembership as any;
  const team = membershipAny?.teams ?? null;

  const { count: proposalCount } = await service
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("team_id", membershipAny?.team_id ?? "00000000-0000-0000-0000-000000000000")
    .in("status", ["pending", "approved"]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sr = studentRecord as any;

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      userFullName={profile.full_name}
    >
      <PageWrapper
        title="Student Dashboard"
        description="Track your team, proposals, and submissions."
      >
        {/* Student info cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">USN</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {sr?.usn ?? "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">CGPA</p>
              <p className="mt-1 text-3xl font-bold" style={{ color: "#1e3a5f" }}>
                {sr?.cgpa?.toFixed(2) ?? "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">Active Proposals</p>
              <p className="mt-1 text-3xl font-bold" style={{ color: "#1e3a5f" }}>
                {proposalCount ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team status */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Current Team</p>
                {team ? (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-semibold text-neutral-900">{team.name}</p>
                    <Badge
                      variant={
                        team.status === "confirmed" ? "confirmed"
                          : team.status === "forming" ? "forming"
                            : "neutral"
                      }
                    >
                      {team.status}
                    </Badge>
                    {membershipAny?.is_lead && <Badge variant="neutral">Team Lead</Badge>}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-neutral-500">Not in a team yet.</p>
                )}
              </div>
              {!team && (
                <a
                  href="/student/teams"
                  className="rounded px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  Find a Team
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "View My Team", href: "/student/teams" },
            { label: "Submit a Proposal", href: "/student/proposals" },
            { label: "View Milestones", href: "/student/milestones" },
            { label: "Upload Submissions", href: "/student/submissions" },
            { label: "Edit Profile", href: "/student/profile" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center justify-between rounded p-4 text-sm font-medium text-neutral-900"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
            >
              {action.label}
              <IconArrowRight size={16} style={{ color: "#1e3a5f", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </PageWrapper>
    </Shell>
  );
}
