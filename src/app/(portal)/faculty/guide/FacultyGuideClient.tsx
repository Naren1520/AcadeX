"use client";

import {
  GuideShell, StepList, InfoBox, RuleTable,
  SectionHeading, StatusPill, VerticalTimeline,
  PermissionMatrix, LabelledFlow,
} from "@/components/guide/GuideComponents";
import {
  IconDashboard, IconClipboard, IconUsers, IconFileText,
  IconFlag, IconUpload, IconBell, IconCheck,
} from "@/components/ui/Icon";

export function FacultyGuideClient() {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: <IconDashboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Faculty portal lets you manage sections, review proposals, create milestones, open submission windows, and monitor team progress.
          </p>

          <div>
            <SectionHeading>Your responsibilities at a glance</SectionHeading>
            <div className="mt-3">
              <PermissionMatrix
                features={[
                  "View assigned sections",
                  "Add / manage students in section",
                  "Create team formation rules",
                  "Review & approve proposals",
                  "Create milestones",
                  "Open submission windows",
                  "Assign team mentors",
                  "Create onboarding invitation links",
                ]}
                roles={[
                  { label: "Faculty", color: "#7c3aed" },
                  { label: "Student", color: "#16a34a" },
                ]}
                matrix={[
                  [true,  false],
                  [true,  false],
                  [true,  false],
                  [true,  false],
                  [true,  false],
                  [true,  false],
                  [true,  false],
                  [true,  false],
                ]}
              />
            </div>
          </div>

          <div>
            <SectionHeading>Full project lifecycle</SectionHeading>
            <div className="mt-3">
              <LabelledFlow steps={[
                { label: "Section assigned", sublabel: "by admin" },
                { label: "Set formation rules", sublabel: "CGPA slots" },
                { label: "Students form teams", sublabel: "forming" },
                { label: "Confirm team", sublabel: "locked" },
                { label: "Review proposals", sublabel: "approve / reject" },
                { label: "Create milestones", sublabel: "deadlines" },
                { label: "Open windows", sublabel: "uploads" },
                { label: "Done", sublabel: "mark complete", color: "#16a34a" },
              ]} />
            </div>
          </div>

          <InfoBox type="note">
            Faculty accounts are created by an administrator. You cannot self-register.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "login",
      title: "Login",
      icon: <IconClipboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <StepList steps={[
            { title: "Navigate to /login", body: "Open the AcadeX login page in your browser." },
            { title: "Enter your credentials", body: "Use the email and password provided by your administrator." },
            { title: "Click Sign In", body: "On success you are redirected to /faculty (the Faculty Dashboard)." },
            { title: "Forgot password", body: "Click the forgot-password link on the login page. A reset link is sent to your email." },
          ]} />

          <RuleTable
            headers={["Situation", "Result"]}
            rows={[
              ["Wrong credentials",         "Error shown — account is not locked."],
              ["Account not created yet",   "Login fails. Contact your admin."],
              ["Faculty visits /student",   "Redirected to /faculty automatically."],
              ["Session expires",           "Redirected to /login automatically."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "sections",
      title: "My Sections",
      icon: <IconClipboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            My Sections shows every section you have been assigned to. Each section card links to a full management page with tabs for every task.
          </p>

          <div>
            <SectionHeading>Section tabs</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Students",           sublabel: "View, add, remove, or bulk-upload students",                       color: "#16a34a", bg: "#f0fdf4" },
                { label: "Teams",              sublabel: "View all teams with member details and CGPA composition",           color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Proposals",          sublabel: "Review proposals submitted by teams in this section",              color: "#d97706", bg: "#fffbeb" },
                { label: "Milestones",         sublabel: "Create and edit milestones linked to approved proposals",          color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Submission Windows", sublabel: "Open or close time windows for student uploads",                   color: "#0369a1", bg: "#f0f9ff" },
                { label: "Onboarding",         sublabel: "Create invitation links and review self-registration submissions",  color: "#dc2626", bg: "#fef2f2" },
                { label: "Mentor",             sublabel: "Assign another faculty member as mentor to any team",              color: "#9333ea", bg: "#fdf4ff" },
              ]} />
            </div>
          </div>

          <InfoBox type="note">
            You cannot add yourself to sections. Only admins can assign you to a section.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "team-formation",
      title: "Team Formation Rules",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Formation rules define how students are allowed to form teams — required size, CGPA bounds, and optional slot composition.
          </p>

          <div>
            <SectionHeading>Example rule structure</SectionHeading>
            <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <p className="text-xs font-semibold text-neutral-500 mb-3">Rule: "Mixed CGPA Group" — size 3, max 10 teams</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { slot: "Slot 1", range: "CGPA 8–10", count: "1 seat", color: "#16a34a", bg: "#f0fdf4" },
                  { slot: "Slot 2", range: "CGPA 7–8",  count: "1 seat", color: "#0369a1", bg: "#f0f9ff" },
                  { slot: "Slot 3", range: "CGPA 6–7",  count: "1 seat", color: "#d97706", bg: "#fffbeb" },
                ].map((s) => (
                  <div key={s.slot} className="rounded-lg px-3 py-2 text-center"
                    style={{ backgroundColor: s.bg, border: `1px solid ${s.color}44`, minWidth: 100 }}>
                    <p className="text-xs font-semibold" style={{ color: s.color }}>{s.slot}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{s.range}</p>
                    <p className="text-xs text-neutral-400">{s.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SectionHeading>Creating a rule</SectionHeading>
          <StepList steps={[
            { title: "Go to Team Formation Rules", body: "Click Team Formation Rules in the sidebar." },
            { title: "Click Add Rule", body: "A dialog opens." },
            { title: "Set label, team size, CGPA range, and max teams", body: "Label is shown to students. Max teams caps how many teams can form under this rule." },
            { title: "Add slot definitions (optional)", body: "Slots specify exact CGPA sub-ranges per seat — e.g. 2 seats for CGPA 8–10, 1 seat for CGPA 6–8." },
            { title: "Click Create Rule", body: "Students immediately see the rule when forming a team." },
          ]} />

          <InfoBox type="warning">
            Once a rule's max team quota is reached students see it as disabled. Increase max teams if more groups are needed.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "proposals",
      title: "Proposals",
      icon: <IconFileText size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Proposals page lists all proposals from teams that selected you as supervisor.
          </p>

          <div>
            <SectionHeading>Proposal lifecycle</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Submitted by team",   sublabel: "status: pending",            color: "#d97706", bg: "#fffbeb" },
                { label: "Faculty reviews",     sublabel: "approve / reject / revise",  color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Approved",            sublabel: "milestones can be created",  color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
                { label: "Rejected",            sublabel: "team submits a new proposal", color: "#dc2626", bg: "#fef2f2" },
                { label: "Revision requested",  sublabel: "team resubmits v2, v3…",     color: "#7c3aed", bg: "#f5f3ff" },
              ]} />
            </div>
          </div>

          <div>
            <SectionHeading>Proposal statuses</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {([
                ["Pending",           "pending",  "Awaiting your review."],
                ["Approved",          "approved", "Approved. Students can now view milestones."],
                ["Rejected",          "rejected", "Rejected with a reason."],
                ["Revision Requested","revision", "Changes required. Student resubmits with new version."],
              ] as [string, "pending"|"approved"|"rejected"|"revision", string][]).map(([label, v, desc]) => (
                <div key={label} className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                  <StatusPill label={label} variant={v} />
                  <span className="text-xs text-neutral-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <InfoBox type="tip">
            Only pending proposals show action buttons. Already-decided proposals are read-only in this view.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "milestones",
      title: "Milestones",
      icon: <IconFlag size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Milestones are deliverable checkpoints linked to an approved proposal. Students must upload work before each deadline.
          </p>

          <div>
            <SectionHeading>Milestone status flow</SectionHeading>
            <div className="mt-3">
              <LabelledFlow steps={[
                { label: "Created",   sublabel: "status: open",      color: "#1e3a5f" },
                { label: "Open",      sublabel: "students upload",    color: "#d97706" },
                { label: "Deadline",  sublabel: "window closes",      color: "#0369a1" },
                { label: "Completed", sublabel: "you mark done",      color: "#16a34a" },
                { label: "Missed",    sublabel: "if no submission",   color: "#dc2626" },
              ]} />
            </div>
          </div>

          <SectionHeading>Creating a milestone</SectionHeading>
          <StepList steps={[
            { title: "Go to Milestones or the section's Milestones tab", body: "Add Milestone is disabled if no approved proposals exist." },
            { title: "Click Add Milestone", body: "A dialog opens." },
            { title: "Select the approved proposal", body: "Only approved proposals appear in the dropdown." },
            { title: "Enter name, description, and deadline", body: "Name is required (max 100 chars). Deadline is a datetime picker." },
            { title: "Click Create", body: "Milestone appears with status open. Students are notified." },
          ]} />

          <InfoBox type="note">
            You can edit the deadline of open milestones. Completed and missed milestones are locked.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "submission-windows",
      title: "Submission Windows",
      icon: <IconUpload size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Submission windows define the time period during which students can upload their PPT, report, and GitHub link for a milestone.
          </p>

          <div>
            <SectionHeading>What students can upload per window</SectionHeading>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { type: "PPT",    formats: ".pptx / .ppt", color: "#1e3a5f", bg: "#eff6ff" },
                { type: "Report", formats: ".pdf only",    color: "#7c3aed", bg: "#f5f3ff" },
                { type: "GitHub", formats: "Repository URL", color: "#16a34a", bg: "#f0fdf4" },
              ].map((f) => (
                <div key={f.type} className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: f.bg, border: `1px solid ${f.color}33` }}>
                  <p className="text-sm font-semibold" style={{ color: f.color }}>{f.type}</p>
                  <p className="mt-1 text-xs text-neutral-500">{f.formats}</p>
                </div>
              ))}
            </div>
          </div>

          <StepList steps={[
            { title: "Go to Submission Windows or the section's Submission Windows tab", body: "Create Window is disabled if no open milestones exist." },
            { title: "Click Create Window", body: "A dialog opens." },
            { title: "Select the milestone", body: "Only open milestones are listed." },
            { title: "Set Opens At and Closes At", body: "Students can upload only during this period." },
            { title: "Click Create", body: "Window is active. Students see it on their Submissions page once it opens." },
          ]} />

          <InfoBox type="warning">
            After a window closes, student uploads are locked. Build in enough buffer time before the deadline.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "onboarding",
      title: "Student Onboarding",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Onboarding tab lets you issue invitation links so students can self-register without you manually creating each account.
          </p>

          <div>
            <SectionHeading>Invitation flow</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Create invitation link",   sublabel: "set passcode, open/close time, max registrations", color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Share link + passcode",    sublabel: "students need both to access the form",            color: "#0369a1", bg: "#f0f9ff" },
                { label: "Student submits form",     sublabel: "name, email, USN, CGPA, skills, GitHub",           color: "#d97706", bg: "#fffbeb" },
                { label: "Review submission",        sublabel: "Submissions tab → Approve or Reject",              color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Account created",          sublabel: "student is enrolled in the section",               color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
              ]} />
            </div>
          </div>

          <InfoBox type="note">
            Invitation links expire at their close time. Create new links for each new batch of students.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <IconBell size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Notifications alert you to events that need your attention. Both in-app and email notifications are sent.
          </p>

          <RuleTable
            headers={["Event", "Notification"]}
            rows={[
              ["Student submits proposal",          "New proposal awaiting review."],
              ["Student resubmits revised proposal", "Revised proposal available."],
              ["Milestone deadline approaching",     "Reminder sent 3 days before deadline."],
              ["Submission uploaded",               "Team has uploaded artefacts for a milestone."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "workflow",
      title: "Complete Workflow",
      icon: <IconFlag size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">The full faculty journey from login to graded project.</p>

          <div>
            <SectionHeading>End-to-end timeline</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Login",                   sublabel: "/faculty",                              color: "#1e3a5f", bg: "#eff6ff" },
                { label: "View assigned sections",  sublabel: "/faculty/sections",                     color: "#0369a1", bg: "#f0f9ff" },
                { label: "Set team formation rules",sublabel: "/faculty/team-formation",               color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Students form teams",     sublabel: "students do this",                      color: "#d97706", bg: "#fffbeb" },
                { label: "Review proposals",        sublabel: "/faculty/proposals — approve / reject", color: "#dc2626", bg: "#fef2f2" },
                { label: "Create milestones",       sublabel: "/faculty/milestones",                   color: "#0369a1", bg: "#f0f9ff" },
                { label: "Open submission windows", sublabel: "/faculty/submission-windows",           color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Students upload work",    sublabel: "students do this",                      color: "#d97706", bg: "#fffbeb" },
                { label: "Mark milestones complete",sublabel: "project cycle done",                    color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
              ]} />
            </div>
          </div>

          <SectionHeading>Common issues</SectionHeading>
          <RuleTable
            headers={["Problem", "Cause", "Fix"]}
            rows={[
              ["Add Milestone disabled",     "No approved proposals",          "Approve a proposal first"],
              ["Create Window disabled",     "No open milestones",             "Create a milestone first"],
              ["Proposals list empty",       "No team selected you as supervisor", "Guide students to submit proposals"],
              ["Cannot edit milestone deadline", "Milestone completed or missed", "Only open milestones allow edits"],
            ]}
          />
        </div>
      ),
    },
  ];

  return <GuideShell sections={sections} />;
}
