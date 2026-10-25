import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { FacultyDashboardClient } from "./FacultyDashboardClient";

export default async function FacultyDashboard() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const service = getSupabaseServiceRoleClient();

  const { data: profile } = await service
    .from("profiles").select("role, full_name").eq("id", userId).single() as
    { data: { role: string; full_name: string } | null };

  if (!profile) redirect("/login");
  if (profile.role === "admin")   redirect("/admin");
  if (profile.role === "student") redirect("/student");
  if (profile.role !== "faculty") redirect("/login");

  // ── Fetch everything in parallel 
  const [
    { data: assignments },
    { data: allProposals },
    { data: allMilestones },
    { data: allTeams },
    { data: allStudents },
    { data: allWindows },
  ] = await Promise.all([
    service.from("faculty_assignments")
      .select("id, section_id, sections(label, department_id, departments(code))")
      .eq("faculty_id", userId),

    service.from("proposals")
      .select("id, status, submitted_at, teams(section_id)")
      .eq("faculty_id", userId)
      .order("submitted_at", { ascending: true }),

    service.from("milestones")
      .select("id, status, deadline, proposals(teams(section_id))")
      .eq("faculty_id", userId)
      .order("deadline"),

    service.from("teams")
      .select("id, status, section_id")
      .in("section_id", []),   // filled below after assignments load

    service.from("students")
      .select("id, cgpa, section_id"),

    service.from("submission_windows")
      .select("id, opens_at, closes_at, milestones(proposals(teams(section_id)))")
      .eq("faculty_id", userId),
  ]);

  const sectionIds = (assignments ?? []).map((a) => a.section_id);

  // Re-fetch teams & students scoped to actual sections
  const [{ data: teams }, { data: students }] = await Promise.all([
    sectionIds.length > 0
      ? service.from("teams").select("id, status, section_id").in("section_id", sectionIds)
      : Promise.resolve({ data: [] }),
    sectionIds.length > 0
      ? service.from("students").select("id, cgpa, section_id").in("section_id", sectionIds)
      : Promise.resolve({ data: [] }),
  ]);

  // ── Shape data for charts 

  // Proposal status distribution
  type RawP = { id: string; status: string; submitted_at: string; teams: { section_id: string } | null };
  const proposalsByStatus = ["pending", "approved", "rejected", "revision_requested"].map((s) => ({
    name: s === "revision_requested" ? "Revision" : s.charAt(0).toUpperCase() + s.slice(1),
    value: (allProposals as unknown as RawP[] ?? []).filter((p) => p.status === s).length,
    color: s === "approved" ? "#16a34a" : s === "pending" ? "#d97706" : s === "rejected" ? "#dc2626" : "#7c3aed",
  }));

  // Proposals submitted over last 6 months
  const now = new Date();
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("en", { month: "short" }) };
  });
  const proposalTrend = monthLabels.map(({ key, label }) => ({
    month: label,
    submitted: (allProposals as unknown as RawP[] ?? []).filter((p) => p.submitted_at?.startsWith(key)).length,
    approved:  (allProposals as unknown as RawP[] ?? []).filter((p) => p.submitted_at?.startsWith(key) && p.status === "approved").length,
  }));

  // Milestone status
  type RawM = { id: string; status: string; deadline: string };
  const milestoneStatus = ["open", "completed", "missed"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: (allMilestones as unknown as RawM[] ?? []).filter((m) => m.status === s).length,
    color: s === "completed" ? "#16a34a" : s === "open" ? "#1e3a5f" : "#dc2626",
  }));

  // Team status
  type RawT = { id: string; status: string; section_id: string };
  const teamStatus = ["forming", "confirmed", "dissolved"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: (teams as unknown as RawT[] ?? []).filter((t) => t.status === s).length,
    color: s === "confirmed" ? "#16a34a" : s === "forming" ? "#d97706" : "#9ca3af",
  }));

  // CGPA distribution across sections
  type RawS = { id: string; cgpa: number; section_id: string };
  const cgpaBands = [
    { range: "9–10", min: 9, max: 10, color: "#16a34a" },
    { range: "8–9",  min: 8, max: 9,  color: "#22c55e" },
    { range: "7–8",  min: 7, max: 8,  color: "#d97706" },
    { range: "6–7",  min: 6, max: 7,  color: "#f59e0b" },
    { range: "<6",   min: 0, max: 6,  color: "#dc2626" },
  ].map((b) => ({
    range: b.range,
    count: (students as unknown as RawS[] ?? []).filter((s) => s.cgpa >= b.min && s.cgpa < b.max).length,
    color: b.color,
  }));

  // Students per section
  type RawA = { id: string; section_id: string; sections: { label: string; departments: { code: string } | null } | null };
  const studentsPerSection = (assignments as unknown as RawA[] ?? []).map((a) => ({
    section: `${a.sections?.label ?? ""} (${a.sections?.departments?.code ?? ""})`,
    students: (students as unknown as RawS[] ?? []).filter((s) => s.section_id === a.section_id).length,
  }));

  // Upcoming milestones (next 30 days)
  const in30 = new Date(Date.now() + 30 * 86400_000).toISOString();
  const upcomingMilestones = (allMilestones as unknown as RawM[] ?? [])
    .filter((m) => m.status === "open" && m.deadline <= in30)
    .slice(0, 5)
    .map((m) => ({ deadline: m.deadline }));

  // Submission windows — currently open
  type RawW = { id: string; opens_at: string; closes_at: string };
  const openWindowsCount = (allWindows as unknown as RawW[] ?? []).filter((w) => {
    const n = Date.now();
    return n >= new Date(w.opens_at).getTime() && n <= new Date(w.closes_at).getTime();
  }).length;

  // Summary stats
  const stats = {
    sections:         sectionIds.length,
    students:         (students ?? []).length,
    pendingProposals: proposalsByStatus.find((p) => p.name === "Pending")?.value ?? 0,
    teams:            (teams ?? []).length,
    openMilestones:   milestoneStatus.find((m) => m.name === "Open")?.value ?? 0,
    openWindows:      openWindowsCount,
  };

  return (
    <Shell role="faculty" navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty" }, { label: "Dashboard" }]}
      userFullName={profile.full_name}>
      <PageWrapper title={`Welcome, ${profile.full_name.split(" ")[0]}`}
        description="Your teaching analytics at a glance.">
        <FacultyDashboardClient
          stats={stats}
          proposalsByStatus={proposalsByStatus}
          proposalTrend={proposalTrend}
          milestoneStatus={milestoneStatus}
          teamStatus={teamStatus}
          cgpaBands={cgpaBands}
          studentsPerSection={studentsPerSection}
          upcomingMilestones={upcomingMilestones}
        />
      </PageWrapper>
    </Shell>
  );
}
