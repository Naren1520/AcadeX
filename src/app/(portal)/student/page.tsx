import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  IconArrowRight, IconDashboard, IconUsers, IconFileText,
  IconFlag, IconUpload, IconSettings, IconBell,
} from "@/components/ui/Icon";
import { getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { studentNav } from "@/config/navigation";

export default async function StudentDashboard() {
  const supabase = await getSupabaseServerClient();

  try {
    await requireRole(supabase, ["student"]);
  } catch {
    redirect("/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: studentRecord } = await supabase
    .from("students")
    .select("cgpa, usn")
    .eq("id", user!.id)
    .single();

  const { data: teamMembership } = await supabase
    .from("team_members")
    .select("team_id, is_lead, teams(name, status)")
    .eq("student_id", user!.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membershipAny = teamMembership as any;
  const { count: proposalCount } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("team_id", membershipAny?.team_id ?? "")
    .in("status", ["pending", "approved"]);

  const team = membershipAny?.teams ?? null;

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper
        title="Student Dashboard"
        description="Track your team, proposals, and submissions."
      >
        {/* Student info card */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">USN</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {studentRecord?.usn ?? "â€”"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">CGPA</p>
              <p
                className="mt-1 text-3xl font-bold"
                style={{ color: "#1e3a5f" }}
              >
                {studentRecord?.cgpa?.toFixed(2) ?? "â€”"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-neutral-500">Active Proposals</p>
              <p
                className="mt-1 text-3xl font-bold"
                style={{ color: "#1e3a5f" }}
              >
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
                        team.status === "confirmed"
                          ? "confirmed"
                          : team.status === "forming"
                          ? "forming"
                          : "neutral"
                      }
                    >
                      {team.status}
                    </Badge>
                    {membershipAny?.is_lead && (
                      <Badge variant="neutral">Team Lead</Badge>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-neutral-500">
                    Not in a team yet.
                  </p>
                )}
              </div>
              {!team && (
                <a
                  href="/portal/student/teams"
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
        <h2 className="mb-3 text-base font-semibold text-neutral-900">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "View My Team", href: "/portal/student/teams" },
            { label: "Submit a Proposal", href: "/portal/student/proposals" },
            { label: "View Milestones", href: "/portal/student/milestones" },
            { label: "Upload Submissions", href: "/portal/student/submissions" },
            { label: "Edit Profile", href: "/portal/student/profile" },
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

