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
  id: string;
  section_id: string;
  label: string;
  team_size: number;
  max_teams: number;
  formed_count: number;
  is_enabled: boolean;
  team_formation_slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[];
  // legacy
  cgpa_lower?: number;
  cgpa_upper?: number;
  min_team_size?: number;
  max_team_size?: number;
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
  const deptName = a.sections?.departments?.name ?? "";
  const deptCode = a.sections?.departments?.code ?? "";

  // Parallel data fetches
  const [
    { data: rawStudents },
    { data: rules },
    { data: rawProposals },
    { data: rawMilestones },
    { data: rawWindows },
    { data: rawAllTeams },
    { data: rawInvitations },
    { data: rawSubmissions },
    { data: rawFacultyList },
    { data: rawSectionTeams },
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
    service.from("teams").select("id, name, status, rule_id, team_formation_rules(label, team_size, team_formation_slots(*)), team_members(student_id, is_lead, students!team_members_student_id_fkey(usn, cgpa, profiles(full_name, email))), team_invitations(id, invitee_id, status, created_at, profiles!team_invitations_invitee_id_fkey(full_name, email))").eq("section_id", sectionId),
    service.from("onboarding_invitations")
      .select("id, label, opens_at, closes_at, max_uses, use_count, is_active, created_at")
      .eq("faculty_id", userId).eq("section_id", sectionId)
      .order("created_at", { ascending: false }),
    service.from("onboarding_submissions")
      .select("id, full_name, email, usn, cgpa, github_url, skills, status, submitted_at, rejection_note, onboarding_invitations!inner(section_id, faculty_id)")
      .eq("onboarding_invitations.faculty_id", userId)
      .eq("onboarding_invitations.section_id", sectionId)
      .order("submitted_at", { ascending: false }),
    // All faculty for mentor assignment
    service.from("profiles").select("id, full_name, email").eq("role", "faculty").order("full_name"),
    // Teams in this section with mentor info
    service.from("teams").select("id, name, status, team_mentors(mentor_id, profiles!team_mentors_mentor_id_fkey(full_name, email))").eq("section_id", sectionId),
  ]);

  // Shape students
  type RS = { id: string; usn: string; cgpa: number; section_id: string | null; github_url: string | null; profiles: { full_name: string; email: string } | null };
  const students: Student[] = (rawStudents as unknown as RS[] ?? []).map((s) => ({
    id: s.id, usn: s.usn, cgpa: s.cgpa, section_id: s.section_id, github_url: s.github_url,
    full_name: s.profiles?.full_name ?? "", email: s.profiles?.email ?? "",
  }));

  const teams = rawAllTeams ?? [];

  // Filter proposals/milestones/windows to this section via their team → section_id link
  const sectionTeamIds = new Set(teams.map((t: { id: string }) => t.id));

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

  type RawInv = { id: string; label: string; opens_at: string; closes_at: string; max_uses: number; use_count: number; is_active: boolean; created_at: string };
  const invitations = (rawInvitations as unknown as RawInv[] ?? []);

  type RawSub = { id: string; full_name: string; email: string; usn: string; cgpa: number; github_url: string | null; skills: string[]; status: string; submitted_at: string; rejection_note: string | null };
  const onboardingSubmissions = (rawSubmissions as unknown as RawSub[] ?? []).map((s) => ({
    ...s, status: s.status as "pending" | "approved" | "rejected",
  }));

  // Approved proposals for milestone creation dropdown
  const approvedProposals = proposals.filter((p) => p.status === "approved").map((p) => ({ id: p.id, title: p.title }));
  // Open milestones for submission window dropdown
  const openMilestones = milestones.filter((m) => m.status === "open").map((m) => ({ id: m.id, name: m.name }));

  // Shape full teams data for TeamsTab
  type RawTeam = {
    id: string; name: string; status: string; rule_id: string;
    team_formation_rules: { label: string | null; team_size: number | null; team_formation_slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[] } | null;
    team_members: { student_id: string; is_lead: boolean; students: { usn: string; cgpa: number; profiles: { full_name: string; email: string } | null } | null }[];
    team_invitations: { id: string; invitee_id: string; status: string; created_at: string; profiles: { full_name: string; email: string } | null }[];
  };
  const teamsData = (rawAllTeams as unknown as RawTeam[] ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status as "forming" | "confirmed" | "dissolved",
    rule_id: t.rule_id,
    rule_label: t.team_formation_rules?.label ?? "",
    team_size: t.team_formation_rules?.team_size ?? 0,
    slots: t.team_formation_rules?.team_formation_slots ?? [],
    members: (t.team_members ?? []).map((m) => ({
      student_id: m.student_id,
      is_lead: m.is_lead,
      full_name: m.students?.profiles?.full_name ?? "",
      email: m.students?.profiles?.email ?? "",
      usn: m.students?.usn ?? "",
      cgpa: m.students?.cgpa ?? 0,
    })),
    pending_invites: (t.team_invitations ?? [])
      .filter((i) => i.status === "pending")
      .map((i) => ({
        id: i.id,
        invitee_id: i.invitee_id,
        full_name: i.profiles?.full_name ?? "",
        email: i.profiles?.email ?? "",
        created_at: i.created_at,
      })),
  }));

  // Real team count per rule (fixes formed_count bug)
  const teamCountByRule: Record<string, number> = {};
  teamsData.forEach((t) => {
    if (t.rule_id) teamCountByRule[t.rule_id] = (teamCountByRule[t.rule_id] ?? 0) + 1;
  });

  const stats = {
    students: students.length,
    teams: (teams ?? []).length,
    pendingProposals: proposals.filter((p) => p.status === "pending").length,
    openMilestones: milestones.filter((m) => m.status === "open").length,
  };

  const facultyList = (rawFacultyList ?? []).map((f: { id: string; full_name: string; email: string }) => ({
    id: f.id, full_name: f.full_name, email: f.email,
  }));

  type RawST = { id: string; name: string; status: string; team_mentors: { mentor_id: string; profiles: { full_name: string; email: string } | null }[] | null };
  const teamsWithMentors = (rawSectionTeams as unknown as RawST[] ?? []).map((t) => {
    const m = t.team_mentors?.[0] ?? null;
    return {
      team_id: t.id,
      team_name: t.name,
      team_status: t.status,
      mentor_id: m?.mentor_id ?? null,
      mentor_name: m?.profiles?.full_name ?? null,
      mentor_email: m?.profiles?.email ?? null,
    };
  });

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[
        { label: "Faculty", href: "/faculty" },
        { label: "My Sections", href: "/faculty/sections" },
        { label: `${sectionLabel} - ${deptCode}` },
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
          departmentId={a.department_id}
          canManageStudents={a.can_manage_students}
          stats={stats}
          initialStudents={students}
          initialRules={rules as unknown as Rule[]}
          initialProposals={proposals}
          initialMilestones={milestones}
          initialWindows={windows}
          approvedProposals={approvedProposals}
          openMilestones={openMilestones}
          initialInvitations={invitations}
          initialOnboardingSubmissions={onboardingSubmissions}
          facultyId={userId}
          facultyList={facultyList}
          teamsWithMentors={teamsWithMentors}
          teamsData={teamsData}
          teamCountByRule={teamCountByRule}
        />
      </PageWrapper>
    </Shell>
  );
}
