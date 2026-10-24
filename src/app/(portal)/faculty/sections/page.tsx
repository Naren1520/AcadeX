import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { SectionListClient } from "./SectionListClient";

export type SectionCard = {
  assignment_id:       string;
  section_id:          string;
  section_label:       string;
  dept_name:           string;
  dept_code:           string;
  can_manage_students: boolean;
  student_count:       number;
  team_count:          number;
  pending_proposals:   number;
  open_milestones:     number;
};

// Keep these for sub-pages
export type SectionWithPermission = SectionCard;

export default async function FacultySectionsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const service = getSupabaseServiceRoleClient();

  const { data: assignments } = await service
    .from("faculty_assignments")
    .select("id, section_id, can_manage_students, sections(label, department_id, departments(name, code))")
    .eq("faculty_id", userId);

  type Raw = {
    id: string; section_id: string; can_manage_students: boolean;
    sections: { label: string; department_id: string; departments: { name: string; code: string } | null } | null;
  };

  const sectionIds = (assignments ?? []).map((a) => a.section_id);

  if (sectionIds.length === 0) {
    return (
      <Shell role="faculty" navItems={facultyNav}
        breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "My Sections" }]}
        userFullName={fullName}>
        <PageWrapper title="My Sections" description="Sections you are assigned to.">
          <div className="rounded-xl p-12 text-center text-sm text-neutral-500"
            style={{ border: "2px dashed #e5e7eb" }}>
            You have no section assignments yet. Contact an admin.
          </div>
        </PageWrapper>
      </Shell>
    );
  }

  // Parallel stats fetches
  const [
    { data: students },
    { data: teams },
    { data: proposals },
    { data: milestones },
  ] = await Promise.all([
    service.from("students").select("id, section_id").in("section_id", sectionIds),
    service.from("teams").select("id, section_id").in("section_id", sectionIds),
    // proposals linked via teams in these sections
    service.from("proposals").select("id, status, teams(section_id)")
      .in("faculty_id", [userId]).eq("status", "pending"),
    service.from("milestones").select("id, proposal_id, proposals(teams(section_id))")
      .eq("faculty_id", userId).eq("status", "open"),
  ]);

  // Count per section
  const studentCount:  Record<string, number> = {};
  const teamCount:     Record<string, number> = {};
  const pendingProps:  Record<string, number> = {};
  const openMiles:     Record<string, number> = {};

  (students ?? []).forEach((s: { section_id: string | null }) => {
    if (s.section_id) studentCount[s.section_id] = (studentCount[s.section_id] ?? 0) + 1;
  });
  (teams ?? []).forEach((t: { section_id: string }) => {
    teamCount[t.section_id] = (teamCount[t.section_id] ?? 0) + 1;
  });
  (proposals ?? []).forEach((p: unknown) => {
    const row = p as { teams: { section_id: string } | null };
    const sid = row.teams?.section_id;
    if (sid) pendingProps[sid] = (pendingProps[sid] ?? 0) + 1;
  });
  (milestones ?? []).forEach((m: unknown) => {
    const row = m as { proposals: { teams: { section_id: string } | null } | null };
    const sid = row.proposals?.teams?.section_id;
    if (sid) openMiles[sid] = (openMiles[sid] ?? 0) + 1;
  });

  const cards: SectionCard[] = (assignments as unknown as Raw[] ?? []).map((a) => ({
    assignment_id:       a.id,
    section_id:          a.section_id,
    section_label:       a.sections?.label ?? "",
    dept_name:           a.sections?.departments?.name ?? "",
    dept_code:           a.sections?.departments?.code ?? "",
    can_manage_students: a.can_manage_students,
    student_count:       studentCount[a.section_id]  ?? 0,
    team_count:          teamCount[a.section_id]     ?? 0,
    pending_proposals:   pendingProps[a.section_id]  ?? 0,
    open_milestones:     openMiles[a.section_id]     ?? 0,
  }));

  return (
    <Shell role="faculty" navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "My Sections" }]}
      userFullName={fullName}>
      <PageWrapper title="My Sections" description="Click a section to manage students, proposals, milestones and more.">
        <SectionListClient cards={cards} />
      </PageWrapper>
    </Shell>
  );
}
