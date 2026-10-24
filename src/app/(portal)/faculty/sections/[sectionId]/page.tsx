import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { SectionDashboard } from "./SectionDashboard";

// ── Shared types exported for child components ────────────────
export type Student = {
  id: string; usn: string; full_name: string; email: string;
  cgpa: number; github_url: string | null; section_id: string | null;
};
export type Rule = {
  id: string; section_id: string; cgpa_lower: number; cgpa_upper: number;
  min_team_size: number; max_team_size: number; max_teams: number; is_enabled: boolean;
};
export type Proposal = {
  id: string; title: string; description: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  version: number; submitted_at: string;
  teams: { name: string; section_id: string } | null;
  proposal_sdgs: { sdg_number: number }[];
};
export type Milestone = {
  id: string; name: string; description: string; deadline: string;
  status: "open" | "completed" | "missed";
  proposal_id: string;
  proposals: { title: string } | null;
};
export type SubmissionWindow = {
  id: string; milestone_id: string; opens_at: string; closes_at: string;
  milestones: { name: string } | null;
};

export default async function SectionDashboardPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const service = getSupabaseServiceRoleClient();

  // Verify assignment exists
  const { data: assignment } = await service
    .from("faculty_assignments")
    .select("id, can_manage_students, department_id, sections(label, departments(name, code))")
    .eq("faculty_id", userId)
    .eq("section_id", sectionId)
    .single();

  if (!assignment) notFound();

  type RawAssignment = {
    id: string; can_manage_students: boolean; department_id: string;
    sections: { label: string; departments: { name: string; code: string } | null } | null;
  };
  const a = assignment as unknown as RawAssignment;
  const sectionLabel = a.sections?.label ?? "";
  const deptName     = a.sections?.departments?.name ?? "";
  const deptCode     = a.sections?.departments?.code ?? "";

  // Parallel data fetches
  const [
    { data: rawStudents },
    { data: rules },
    { data: rawProposals },
    { data: rawMilestones },
    { data: rawWindows },
    { data: teams },
  ] = await Promise.all([
    service.from("students")
      .select("id, usn, cgpa, section_id, github_url, profiles(full_name, email)")
      .eq("section_id", sectionId).order("usn"),
    service.from("team_formation_rules")
      .select("*").eq("section_id", sectionId).eq("faculty_id", userId).order("created_at"),
    service.from("proposals")
      .select("id, title, description, status, version, submitted_at, proposal_sdgs(sdg_number), teams(name, section_id)")
      .eq("faculty_id", userId)
      .in("status", ["pending", "approved", "rejected", "revision_requested"])
      .order("submitted_at", { ascending: false }),
    service.from("milestones")
      .select("id, name, description, deadline, status, proposal_id, proposals(title, teams(section_id))")
      .eq("faculty_id", userId).order("deadline"),
    service.from("submission_windows")
      .select("id, milestone_id, opens_at, closes_at, milestones(name, proposals(teams(section_id)))")
      .eq("faculty_id", userId).order("opens_at", { ascending: false }),
    service.from("teams").select("id").eq("section_id", sectionId),
  ]);

  // Shape students
  type RS = { id: string; usn: string; cgpa: number; section_id: string | null; github_url: string | null; profiles: { full_name: string; email: string } | null };
  const students: Student[] = (rawStudents as unknown as RS[] ?? []).map((s) => ({
    id: s.id, usn: s.usn, cgpa: s.cgpa, section_id: s.section_id, github_url: s.github_url,
    full_name: s.profiles?.full_name ?? "", email: s.profiles?.email ?? "",
  }));

  // Filter proposals/milestones/windows to this section via their team → section_id link
  const sectionTeamIds = new Set((teams ?? []).map((t: { id: string }) => t.id));

  type RP = { id: string; title: string; description: string; status: string; version: number; submitted_at: string; proposal_sdgs: { sdg_number: number }[]; teams: { name: string; section_id: string } | null };
  const proposals: Proposal[] = (rawProposals as unknown as RP[] ?? [])
    .filter((p) => p.teams?.section_id === sectionId)
    .map((p) => ({ ...p, status: p.status as Proposal["status"] }));

  type RM = { id: string; name: string; description: string; deadline: string; status: string; proposal_id: string; proposals: { title: string; teams: { section_id: string } | null } | null };
  const milestones: Milestone[] = (rawMilestones as unknown as RM[] ?? [])
    .filter((m) => m.proposals?.teams?.section_id === sectionId)
    .map((m) => ({ ...m, status: m.status as Milestone["status"], proposals: m.proposals ? { title: m.proposals.title } : null }));

  const approvedProposalIds = new Set(proposals.filter((p) => p.status === "approved").map((p) => p.id));
  const milestoneIds = new Set(milestones.map((m) => m.id));

  type RW = { id: string; milestone_id: string; opens_at: string; closes_at: string; milestones: { name: string; proposals: { teams: { section_id: string } | null } | null } | null };
  const windows: SubmissionWindow[] = (rawWindows as unknown as RW[] ?? [])
    .filter((w) => milestoneIds.has(w.milestone_id))
    .map((w) => ({ ...w, milestones: w.milestones ? { name: w.milestones.name } : null }));

  // Approved proposals for milestone creation dropdown
  const approvedProposals = proposals.filter((p) => p.status === "approved").map((p) => ({ id: p.id, title: p.title }));
  // Open milestones for submission window dropdown
  const openMilestones = milestones.filter((m) => m.status === "open").map((m) => ({ id: m.id, name: m.name }));

  const stats = {
    students:         students.length,
    teams:            (teams ?? []).length,
    pendingProposals: proposals.filter((p) => p.status === "pending").length,
    openMilestones:   milestones.filter((m) => m.status === "open").length,
  };

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[
        { label: "Faculty",     href: "/faculty" },
        { label: "My Sections", href: "/faculty/sections" },
        { label: `${sectionLabel} — ${deptCode}` },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title={`Section ${sectionLabel}`}
        description={`${deptName} · Manage students, proposals, milestones and submission windows`}
      >
        <SectionDashboard
          sectionId={sectionId}
          sectionLabel={sectionLabel}
          deptCode={deptCode}
          deptName={deptName}
          canManageStudents={a.can_manage_students}
          stats={stats}
          initialStudents={students}
          initialRules={rules as unknown as Rule[]}
          initialProposals={proposals}
          initialMilestones={milestones}
          initialWindows={windows}
          approvedProposals={approvedProposals}
          openMilestones={openMilestones}
        />
      </PageWrapper>
    </Shell>
  );
}
