import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const { userId, fullName } = await requirePageRole(["admin"]);
  const service = getSupabaseServiceRoleClient();

  const [
    { count: deptCount },
    { count: studentCount },
    { count: facultyCount },
    { count: sectionCount },
    { count: teamCount },
    { count: proposalCount },
    { data: departments },
    { data: students },
    { data: facultyAssignments },
    { data: teams },
    { data: proposals },
    { data: semesters },
    { data: sections },
    { data: recentProfiles },
  ] = await Promise.all([
    service.from("departments").select("id", { count: "exact", head: true }).eq("is_active", true),
    service.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    service.from("profiles").select("id", { count: "exact", head: true }).eq("role", "faculty"),
    service.from("sections").select("id", { count: "exact", head: true }),
    service.from("teams").select("id", { count: "exact", head: true }),
    service.from("proposals").select("id", { count: "exact", head: true }),
    service.from("departments").select("id, code").eq("is_active", true),
    service.from("students").select("id, department_id"),
    service.from("faculty_assignments").select("faculty_id, department_id"),
    service.from("teams").select("id, status"),
    service.from("proposals").select("id, status"),
    service.from("semesters").select("id, label"),
    service.from("sections").select("id, semester_id"),
    service.from("profiles").select("role, created_at").in("role", ["student", "faculty"]),
  ]);

  // Students per department
  type Dept = { id: string; code: string };
  const deptList = (departments ?? []) as Dept[];

  const studentsByDept = deptList.map((d) => ({
    dept: d.code,
    count: (students ?? []).filter((s: { department_id: string }) => s.department_id === d.id).length,
  }));

  // Faculty per department (via assignments — count unique faculty per dept)
  const facultyByDept = deptList.map((d) => {
    const unique = new Set(
      (facultyAssignments ?? [])
        .filter((a: { department_id: string }) => a.department_id === d.id)
        .map((a: { faculty_id: string }) => a.faculty_id)
    );
    return { dept: d.code, count: unique.size };
  });

  // Team status breakdown
  const teamStatusMap: Record<string, number> = {};
  (teams ?? []).forEach((t: { status: string }) => {
    teamStatusMap[t.status] = (teamStatusMap[t.status] ?? 0) + 1;
  });
  const teamsByStatus = [
    { name: "Forming",   value: teamStatusMap["forming"]   ?? 0, color: "#d97706" },
    { name: "Confirmed", value: teamStatusMap["confirmed"] ?? 0, color: "#16a34a" },
    { name: "Dissolved", value: teamStatusMap["dissolved"] ?? 0, color: "#9ca3af" },
  ];

  // Proposal status breakdown
  const propStatusMap: Record<string, number> = {};
  (proposals ?? []).forEach((p: { status: string }) => {
    propStatusMap[p.status] = (propStatusMap[p.status] ?? 0) + 1;
  });
  const proposalsByStatus = [
    { name: "Pending",  value: propStatusMap["pending"]            ?? 0, color: "#d97706" },
    { name: "Approved", value: propStatusMap["approved"]           ?? 0, color: "#16a34a" },
    { name: "Rejected", value: propStatusMap["rejected"]           ?? 0, color: "#dc2626" },
    { name: "Revision", value: propStatusMap["revision_requested"] ?? 0, color: "#7c3aed" },
  ];

  // Sections per semester
  type Semester = { id: string; label: string };
  const semList = (semesters ?? []) as Semester[];
  const sectionsBySemester = semList.map((sem) => ({
    semester: sem.label,
    sections: (sections ?? []).filter((s: { semester_id: string }) => s.semester_id === sem.id).length,
  })).filter((s) => s.sections > 0);

  // Registration trend — last 6 months
  const now = new Date();
  const registrationTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleDateString("en", { month: "short" });
    const profilesInMonth = (recentProfiles ?? []).filter((p: { created_at: string }) =>
      p.created_at.startsWith(key)
    );
    return {
      month: monthLabel,
      students: profilesInMonth.filter((p: { role: string }) => p.role === "student").length,
      faculty:  profilesInMonth.filter((p: { role: string }) => p.role === "faculty").length,
    };
  });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      userFullName={fullName}
    >
      <PageWrapper
        title="Admin Dashboard"
        description="Overview of the platform's academic structure and activity."
      >
        <AdminDashboardClient
          stats={{
            departments: deptCount ?? 0,
            students:    studentCount ?? 0,
            faculty:     facultyCount ?? 0,
            sections:    sectionCount ?? 0,
            teams:       teamCount ?? 0,
            proposals:   proposalCount ?? 0,
          }}
          studentsByDept={studentsByDept}
          facultyByDept={facultyByDept}
          teamsByStatus={teamsByStatus}
          proposalsByStatus={proposalsByStatus}
          registrationTrend={registrationTrend}
          sectionsBySemester={sectionsBySemester}
        />
      </PageWrapper>
    </Shell>
  );
}
