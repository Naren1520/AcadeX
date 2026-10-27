"use client";

import { useState } from "react";

// ── Shared sub-components (same pattern as student guide) ─
function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: "#1e3a5f" }}
      >
        {num}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-neutral-900 mb-1">{title}</p>
        <div className="text-sm text-neutral-600">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({ type, children }: { type: "note" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    note: { bg: "#eff6ff", border: "#bfdbfe", label: "Note", labelColor: "#1e3a5f" },
    warning: { bg: "#fef3c7", border: "#fde68a", label: "Warning", labelColor: "#92400e" },
    tip: { bg: "#f0fdf4", border: "#bbf7d0", label: "Tip", labelColor: "#15803d" },
  }[type];
  return (
    <div className="rounded-lg px-4 py-3 mb-4" style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}` }}>
      <span className="text-xs font-bold uppercase tracking-wide mr-2" style={{ color: styles.labelColor }}>
        {styles.label}:
      </span>
      <span className="text-sm" style={{ color: styles.labelColor }}>{children}</span>
    </div>
  );
}

function UiButton({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: "#1e3a5f", color: "#ffffff" }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold mr-1" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

function FlowRow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 my-4">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: i === steps.length - 1 ? "#16a34a" : "#1e3a5f" }}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="hidden sm:inline text-neutral-400 text-sm">→</span>}
        </div>
      ))}
    </div>
  );
}

function GuideTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded overflow-x-auto mb-4" style={{ border: "1px solid #e5e7eb", WebkitOverflowScrolling: "touch" }}>
      <table className="text-sm" style={{ minWidth: "100%", width: "max-content" }}>
        <thead style={{ backgroundColor: "#f9fafb" }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b whitespace-nowrap" style={{ borderColor: "#e5e7eb" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-neutral-700 text-xs border-b" style={{ borderColor: "#e5e7eb", minWidth: j === 0 ? "130px" : "160px" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sections ─────────
interface Section { id: string; title: string; content: React.ReactNode; }

export function FacultyGuideClient() {
  const [activeSection, setActiveSection] = useState("login");

  const sections: Section[] = [
    {
      id: "login",
      title: "Login & Authentication",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Faculty accounts are created by the administrator. You do not self-register.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Logging in</h3>
          <Step num={1} title="Navigate to the login page">
            Go to <span className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">/login</span>.
          </Step>
          <Step num={2} title="Enter your email and password">
            Use the credentials provided by your administrator.
          </Step>
          <Step num={3} title='Click "Sign In"'>
            On success you are redirected to <code className="text-xs">/faculty</code> (the Faculty Dashboard).
          </Step>
          <Step num={4} title="Role-based redirect">
            If your account is not a faculty role, the system redirects you to the appropriate portal or back to login.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Forgot password</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Click the forgot-password link on the login page, enter your email, and follow the reset link sent to your inbox.
          </p>

          <GuideTable
            headers={["Situation", "What happens"]}
            rows={[
              ["Wrong credentials", "Error shown, no lockout."],
              ["Account not created", "Login fails. Contact system admin."],
              ["Session expires", "Redirected to /login automatically."],
              ["Faculty tries /student", "Redirected to /faculty."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Faculty Dashboard",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Dashboard (<code className="text-xs">/faculty</code>) gives a real-time overview of all your sections, teams, proposals, and milestones through stat cards and charts.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Stat cards (top row)</h3>
          <GuideTable
            headers={["Card", "Value shown", "Clicking goes to…"]}
            rows={[
              ["Sections", "Total sections assigned to you.", "/faculty/sections"],
              ["Students", "Total students across your sections.", "/faculty/sections"],
              ["Pending Proposals", "Proposals awaiting your review.", "/faculty/proposals"],
              ["Teams", "Total teams in your sections.", "/faculty/sections"],
              ["Open Milestones", "Milestones currently in 'open' state.", "/faculty/milestones"],
              ["Open Windows", "Submission windows currently open.", "/faculty/submission-windows"],
            ]}
          />

          <InfoBox type="tip">
            Each stat card is a clickable link — click any card to jump directly to that management page.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Charts (analytics section)</h3>
          <GuideTable
            headers={["Chart", "What it visualises"]}
            rows={[
              ["Proposal Activity (area chart)", "Submitted vs Approved proposals over the last 6 months."],
              ["Proposals by Status (pie chart)", "Breakdown: Pending / Approved / Rejected / Revision."],
              ["Student CGPA Distribution (bar)", "How many students fall in each CGPA band (9-10, 8-9, 7-8, 6-7, <6)."],
              ["Students per Section (horizontal bar)", "Headcount in each of your sections."],
              ["Milestone Status (pie chart)", "Open / Completed / Missed milestones."],
              ["Team Status (donut chart)", "Forming / Confirmed / Dissolved teams."],
              ["Upcoming Deadlines (list)", "Milestones due in the next 30 days; urgent (≤3 days) highlighted in red."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Quick Actions (bottom row)</h3>
          <GuideTable
            headers={["Button", "Destination"]}
            rows={[
              ["Review Proposals", "/faculty/proposals"],
              ["My Sections", "/faculty/sections"],
              ["Create Milestone", "/faculty/milestones"],
              ["Open Submission Window", "/faculty/submission-windows"],
            ]}
          />
        </div>
      ),
    },
    {
      id: "sections",
      title: "My Sections",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Sections page (<code className="text-xs">/faculty/sections</code>) shows all sections you have been assigned to by the administrator.
          </p>

          <InfoBox type="note">
            Faculty cannot add themselves to sections. Only an administrator can assign faculty to sections.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3">Sections list</h3>
          <GuideTable
            headers={["Column", "Meaning"]}
            rows={[
              ["Section label", "e.g., A, B, C — identifier within a department."],
              ["Department", "Department code (e.g., CSE, ECE)."],
              ["Student count", "Number of students in this section."],
              ["Team count", "Number of teams formed within this section."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Section detail page</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Click on a section row to go to <code className="text-xs">/faculty/sections/{`{sectionId}`}</code>. Here you can see all students and teams in that section.
          </p>
          <GuideTable
            headers={["Tab / Panel", "Shows"]}
            rows={[
              ["Students list", "Name, USN, CGPA of every student in the section."],
              ["Teams list", "Team name, status (forming / confirmed / dissolved), member count."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "teams-management",
      title: "Mentee Teams & Team Formation",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Faculty supervise teams that have been assigned to them as a mentor. They also define the rules under which students can form teams.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Mentee Teams (<code className="text-xs">/faculty/mentee</code>)</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Lists all teams you are currently mentoring. You can see each team's status and members.
          </p>
          <GuideTable
            headers={["Status", "Meaning"]}
            rows={[
              ["forming", "Team is assembling; students can still join."],
              ["confirmed", "Team is locked; students can now submit proposals."],
              ["dissolved", "Team disbanded by admin or faculty."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Team Formation Rules (<code className="text-xs">/faculty/team-formation</code>)</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Formation rules control how students can group themselves. You create rules; students see them when forming teams.
          </p>

          <h4 className="font-semibold text-neutral-700 mb-2">Creating a formation rule</h4>
          <Step num={1} title='Click "Add Rule"'>
            Opens a dialog.
          </Step>
          <Step num={2} title="Set rule label, team size, CGPA range, and max teams">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Label</strong> — Friendly name (e.g., "Mixed CGPA Group").</li>
              <li><strong>Team size</strong> — Number of members required.</li>
              <li><strong>CGPA lower / upper</strong> — Overall CGPA bounds.</li>
              <li><strong>Max teams</strong> — Maximum teams that can form under this rule.</li>
            </ul>
          </Step>
          <Step num={3} title="Add slot definitions (optional)">
            Slots let you specify exact CGPA sub-ranges per seat. E.g., "2 seats for CGPA 8–10 and 1 seat for CGPA 6–8". Click <UiButton>Add Slot</UiButton> for each requirement.
          </Step>
          <Step num={4} title='Click "Create Rule"'>
            Rule is saved and visible to students in their team-formation view.
          </Step>

          <InfoBox type="warning">
            Once a rule's max team quota is reached, students see it as "quota full" and cannot form new teams under it.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "proposals",
      title: "Reviewing Proposals",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Proposals page (<code className="text-xs">/faculty/proposals</code>) lists all proposals submitted by student teams that selected you as their supervisor.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Proposal list columns</h3>
          <GuideTable
            headers={["Column", "Meaning"]}
            rows={[
              ["Title", "Project title as submitted by the team."],
              ["Team", "Team name that submitted the proposal."],
              ["Submitted at", "Date and time of submission."],
              ["Status", "Current status badge."],
              ["Actions", "Buttons: Approve / Reject / Request Revision (for pending proposals)."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Proposal statuses</h3>
          <GuideTable
            headers={["Status", "Colour", "Meaning"]}
            rows={[
              ["pending", "Amber", "Awaiting your review."],
              ["approved", "Green", "You approved it. Students can now view milestones."],
              ["rejected", "Red", "You rejected it with a reason."],
              ["revision requested", "Orange", "You requested changes; student resubmits."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Approving a proposal</h3>
          <Step num={1} title="Find the proposal in Pending status">
            Use the list on the proposals page.
          </Step>
          <Step num={2} title='Click "Approve"'>
            The status changes to <StatusBadge label="approved" color="#15803d" bg="#f0fdf4" />. Students are notified.
          </Step>
          <InfoBox type="note">
            After approval, you can create milestones and submission windows for this proposal.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-2">Rejecting a proposal</h3>
          <Step num={1} title='Click "Reject"'>
            A dialog opens asking for a rejection reason.
          </Step>
          <Step num={2} title="Enter a reason and confirm">
            The reason is shown to students on their Proposals page. Status becomes <StatusBadge label="rejected" color="#dc2626" bg="#fef2f2" />.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-2">Requesting revision</h3>
          <Step num={1} title='Click "Request Revision"'>
            A dialog opens for revision notes.
          </Step>
          <Step num={2} title="Enter revision notes">
            Be specific. Students see exactly what to change. Status becomes <StatusBadge label="revision requested" color="#c2410c" bg="#fff7ed" />.
          </Step>
          <Step num={3} title="Student resubmits">
            The revised proposal appears again with a new version number. Review it again.
          </Step>

          <InfoBox type="tip">
            Only <strong>pending</strong> proposals show action buttons. Approved / rejected proposals cannot be changed directly through this view.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "milestones",
      title: "Milestones",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Milestones page (<code className="text-xs">/faculty/milestones</code>) lets you create and manage deliverable checkpoints for approved proposals.
          </p>

          <InfoBox type="note">
            You can only create milestones for proposals that are <StatusBadge label="approved" color="#15803d" bg="#f0fdf4" />. If no approved proposals exist, the <UiButton>Add Milestone</UiButton> button is disabled.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3">Milestones table columns</h3>
          <GuideTable
            headers={["Column", "Meaning"]}
            rows={[
              ["Name", "Short name of the milestone (e.g., 'Mid-Term Review')."],
              ["Proposal", "The approved proposal this milestone belongs to."],
              ["Deadline", "Date by which students must submit."],
              ["Status", "open / completed / missed."],
              ["Actions", "Edit Deadline button — only for open milestones."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Creating a milestone</h3>
          <Step num={1} title='Click "Add Milestone"'>
            Dialog opens.
          </Step>
          <Step num={2} title="Select a proposal">
            Choose from the dropdown (only approved proposals listed).
          </Step>
          <Step num={3} title="Fill in Name, Description, Deadline">
            Name is required (max 100 chars). Deadline is a datetime picker.
          </Step>
          <Step num={4} title='Click "Create"'>
            Milestone appears in the table with status <StatusBadge label="open" color="#92400e" bg="#fef3c7" />. Students see it on their Milestones page.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Editing a deadline</h3>
          <Step num={1} title='Click "Edit Deadline" next to an open milestone'>
            A dialog opens with a datetime picker.
          </Step>
          <Step num={2} title="Select a new deadline and click Update">
            Deadline is updated immediately.
          </Step>

          <InfoBox type="warning">
            You cannot edit the deadline of completed or missed milestones. Status transitions (open → completed / missed) are handled by the system based on submissions and the deadline.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "submission-windows",
      title: "Submission Windows",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Submission Windows (<code className="text-xs">/faculty/submission-windows</code>) define the time periods during which students can upload their milestone deliverables.
          </p>

          <InfoBox type="note">
            You must have at least one open milestone before creating a submission window. The <UiButton>Create Window</UiButton> button is disabled if no milestones exist.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3">Submission windows table</h3>
          <GuideTable
            headers={["Column", "Meaning"]}
            rows={[
              ["Milestone", "The milestone this window is linked to."],
              ["Opens", "Date/time when students can start uploading."],
              ["Closes", "Date/time when the window shuts. No uploads accepted after this."],
              ["Status", "Open (green) if current time is between Opens and Closes, else Closed (grey)."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Creating a submission window</h3>
          <Step num={1} title='Click "Create Window"'>
            Dialog opens.
          </Step>
          <Step num={2} title="Select a milestone">
            Choose from the dropdown (only open milestones shown).
          </Step>
          <Step num={3} title="Set Opens At and Closes At datetimes">
            Use the datetime-local pickers. Closes At must be after Opens At.
          </Step>
          <Step num={4} title='Click "Create"'>
            Window is created. Students see it on their Submissions page once it opens.
          </Step>

          <InfoBox type="tip">
            You can create multiple windows for the same milestone (e.g., an early submission window and a late submission window). Students upload within whichever window is open.
          </InfoBox>

          <InfoBox type="warning">
            Once a window closes, student uploads are locked. Create windows with generous time buffers to avoid student issues.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "students",
      title: "Students View",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Students page (<code className="text-xs">/faculty/students</code>) shows all students in your assigned sections.
          </p>
          <GuideTable
            headers={["Column", "Meaning"]}
            rows={[
              ["Name", "Student full name."],
              ["USN", "University Seat Number."],
              ["CGPA", "Cumulative grade point average."],
              ["Section", "Section this student belongs to."],
              ["Team", "Team name if the student has joined one, else blank."],
            ]}
          />
          <InfoBox type="note">
            Faculty cannot edit student records. Contact the administrator to update USN or CGPA data.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notifications",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Notifications (<code className="text-xs">/faculty/notifications</code>) alert you to important events that need your attention.
          </p>
          <GuideTable
            headers={["Event", "Notification shown to faculty"]}
            rows={[
              ["Student submits proposal", "New proposal submitted — requires your review."],
              ["Student resubmits revised proposal", "Revised proposal available."],
              ["Milestone deadline approaching", "Reminder that a milestone deadline is near."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "workflow",
      title: "Complete Faculty Workflow",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            This section maps the full faculty journey from login to grading a completed project.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">End-to-end flow</h3>
          <FlowRow steps={["Login (/login)", "Faculty Dashboard (/faculty)"]} />
          <FlowRow steps={["View assigned sections (/faculty/sections)", "Monitor teams forming"]} />
          <FlowRow steps={["Set team formation rules (/faculty/team-formation)", "Students form teams"]} />
          <FlowRow steps={["Students submit proposals", "Review proposals (/faculty/proposals)"]} />
          <FlowRow steps={["Approve proposal", "Create Milestones (/faculty/milestones)"]} />
          <FlowRow steps={["Create Submission Windows (/faculty/submission-windows)", "Students upload deliverables"]} />
          <FlowRow steps={["Review submissions", "Mark milestone complete"]} />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-6">Edge cases & resolutions</h3>
          <GuideTable
            headers={["Situation", "Cause", "Resolution"]}
            rows={[
              ["'Add Milestone' is disabled", "No approved proposals exist yet.", "Approve a proposal first on /faculty/proposals."],
              ["'Create Window' is disabled", "No open milestones.", "Create a milestone first on /faculty/milestones."],
              ["Proposals list is empty", "No student teams have selected you as supervisor.", "Ensure teams are confirmed and students are guided to submit proposals."],
              ["Stat cards show zero", "No section assignments.", "Contact admin to assign you to sections."],
              ["Cannot edit deadline", "Milestone status is 'completed' or 'missed'.", "Only open milestones allow deadline edits."],
              ["Team is stuck in 'forming'", "Faculty / admin needs to confirm the team.", "Confirm the team via the admin or mentee management panel."],
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Mobile section select — sits above content on small screens */}
      <div className="lg:hidden mb-4">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Jump to section</label>
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="block w-full rounded px-3 py-2 text-sm"
          style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }}
        >
          {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block w-56 flex-shrink-0"
          style={{ position: "sticky", top: "1.5rem", alignSelf: "flex-start" }}
        >
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <div className="px-4 py-3" style={{ backgroundColor: "#1e3a5f" }}>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Sections</p>
            </div>
            <nav className="flex flex-col">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="px-4 py-2.5 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: activeSection === s.id ? "#eff6ff" : i % 2 === 0 ? "#ffffff" : "#f9fafb",
                    color: activeSection === s.id ? "#1e3a5f" : "#374151",
                    fontWeight: activeSection === s.id ? "600" : "400",
                    borderLeft: activeSection === s.id ? "3px solid #1e3a5f" : "3px solid transparent",
                  }}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {sections.map((s) =>
            s.id === activeSection ? (
              <div key={s.id}>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">{s.title}</h2>
                <div className="mb-6 h-1 w-16 rounded" style={{ backgroundColor: "#1e3a5f" }} />
                {s.content}
              </div>
            ) : null
          )}
        </main>
      </div>
    </div>
  );
}
