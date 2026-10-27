"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

// ── Step component ─────────────────────────────────────────────────────────────
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

// ── Info box ──────────────────────────────────────────────────────────────────
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

// ── Button pill (visual only, describes a button in the UI) ───────────────────
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

// ── Badge visual ──────────────────────────────────────────────────────────────
function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold mr-1" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

// ── Flow diagram row ──────────────────────────────────────────────────────────
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
          {i < steps.length - 1 && (
            <span className="hidden sm:inline text-neutral-400 text-sm">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
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

// ── Main guide client ─────────────────────────────────────────────────────────
export function StudentGuideClient() {
  const [activeSection, setActiveSection] = useState("login");

  const sections: Section[] = [
    {
      id: "login",
      title: "Login & Authentication",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            AcadeX uses a secure email-and-password login system. Your account is created by the administrator - you do not self-register.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">How to log in</h3>
          <Step num={1} title="Navigate to the login page">
            Go to <span className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">/login</span>. You will see an email and password field.
          </Step>
          <Step num={2} title="Enter your credentials">
            Type the email address and password provided by your administrator. Credentials are sent to your registered email.
          </Step>
          <Step num={3} title='Click "Sign In"'>
            Press <UiButton>Sign In</UiButton>. If credentials are correct you are redirected to your Student Dashboard at <span className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">/student</span>.
          </Step>
          <Step num={4} title="Role-based redirect">
            The system reads your role from your profile. Students are always sent to <code className="text-xs">/student</code>. If your role is faculty or admin you would be redirected to those dashboards instead.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-6">Forgot password</h3>
          <Step num={1} title='Click "Forgot password?"'>
            Below the Sign In button on the login page, click the forgot-password link.
          </Step>
          <Step num={2} title="Enter your email">
            Type your registered email and submit. A password-reset email is sent.
          </Step>
          <Step num={3} title="Reset via email link">
            Open the email and click the reset link. Set a new password and log in again.
          </Step>

          <InfoBox type="warning">
            If you do not receive a reset email, check your spam folder or contact your department administrator.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-2">Edge cases</h3>
          <GuideTable
            headers={["Situation", "What happens"]}
            rows={[
              ["Wrong email / password", "Error message shown; account is not locked."],
              ["Account not yet created by admin", "Login fails. Contact your administrator."],
              ["Session expires", "You are redirected to /login automatically."],
              ["Non-student role tries /student", "Redirected to the correct portal (/faculty or /admin)."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Student Dashboard",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The dashboard (<code className="text-xs">/student</code>) is your home screen. It gives you a snapshot of your academic status.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Dashboard cards</h3>
          <GuideTable
            headers={["Card", "What it shows"]}
            rows={[
              ["USN", "Your University Seat Number pulled from the student record."],
              ["CGPA", "Your current CGPA as entered by the administrator."],
              ["Active Proposals", "Number of proposals with status Pending or Approved."],
              ["Current Team", "Team name and status badge (forming / confirmed). Shows 'Not in a team yet' if unassigned."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Quick Actions</h3>
          <p className="text-sm text-neutral-600 mb-3">
            A row of shortcut cards at the bottom links to each major feature:
          </p>
          <GuideTable
            headers={["Button", "Destination", "When to use"]}
            rows={[
              ["View My Team", "/student/teams", "Check team members, invite teammates, see team status."],
              ["Submit a Proposal", "/student/proposals", "Create or review project proposals."],
              ["View Milestones", "/student/milestones", "See milestone timeline and deadlines."],
              ["Upload Submissions", "/student/submissions", "Upload PPT, report, and GitHub link."],
              ["Edit Profile", "/student/profile", "Update personal information."],
            ]}
          />

          <InfoBox type="note">
            If you are not yet in a team, a <UiButton>Find a Team</UiButton> button appears inside the Current Team card. Click it to go directly to the Teams page.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "teams",
      title: "My Team",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Teams page (<code className="text-xs">/student/teams</code>) handles everything related to team formation. The view changes depending on whether you are already in a team.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">System flow - joining a team</h3>
          <FlowRow steps={["Not in a team", "Join existing OR Form new", "In team (forming)", "Team confirmed", "Can submit proposals"]} />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-2">When you are NOT in a team</h3>
          <p className="text-sm text-neutral-600 mb-3">You see two panels side by side:</p>

          <div className="mb-4 rounded p-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
            <p className="font-semibold text-neutral-800 text-sm mb-2">Panel A - Available Teams</p>
            <p className="text-sm text-neutral-600 mb-2">Lists all existing teams in your section that are still <StatusBadge label="forming" color="#92400e" bg="#fef3c7" /> and have open slots.</p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
              <li>Each card shows the team name, formation rule, and CGPA slot requirements.</li>
              <li>If your CGPA does not fit any slot, the <UiButton>Join</UiButton> button is disabled and a red message appears.</li>
              <li>If eligible, click <UiButton>Join</UiButton> - page reloads and you are now a member.</li>
            </ul>
          </div>

          <div className="mb-4 rounded p-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
            <p className="font-semibold text-neutral-800 text-sm mb-2">Panel B - Form a New Team</p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
              <li>Enter a <strong>Team Name</strong> (max 100 characters).</li>
              <li>Select a <strong>Formation Rule</strong> from the dropdown. Rules set the team size and CGPA composition.</li>
              <li>If a rule has CGPA slots, a composition preview is shown (e.g., "2× CGPA 8–10, 1× CGPA 6–8").</li>
              <li>Ineligible or quota-full rules are shown as disabled options.</li>
              <li>Click <UiButton>Form Team</UiButton> - you become the Team Lead of the new team.</li>
            </ul>
          </div>

          <InfoBox type="tip">
            As the student who forms a team, you automatically become the <strong>Team Lead</strong>. Only the lead can invite others.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">When you ARE in a team</h3>
          <p className="text-sm text-neutral-600 mb-3">You see your team card with members and a pending-invitations inbox (if any).</p>
          <GuideTable
            headers={["Section", "What it shows"]}
            rows={[
              ["Team name & status badge", "Team name with forming / confirmed / dissolved badge."],
              ["Team Lead badge", "Visible next to your name if you are the lead."],
              ["Members list", "All joined members with USN and CGPA. Your row has '(you)'."],
              ["Invited - Awaiting Response", "Students invited but not yet responded. Visible to lead."],
              ["Invite a Student button", "Only visible to Team Lead when team is 'forming'. Opens a dialog."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Inviting a student (Team Lead only)</h3>
          <Step num={1} title='Click "Invite a Student"'>
            The button is only shown when you are the lead and the team is still forming. If all eligible section mates are already invited, the button is disabled.
          </Step>
          <Step num={2} title="Select a student from the dropdown">
            The dropdown shows only section mates who are: (a) not already in your team, (b) not already invited, (c) in your section.
          </Step>
          <Step num={3} title='Click "Send Invitation"'>
            The invitation is sent. The student appears in the "Invited - Awaiting Response" list with a <span className="text-xs font-medium" style={{ color: "#d97706" }}>Pending…</span> label.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Receiving an invitation (non-lead)</h3>
          <p className="text-sm text-neutral-600 mb-3">
            If another team lead invites you, an <strong>Team Invitations</strong> banner appears at the top of the Teams page.
          </p>
          <GuideTable
            headers={["Button", "Effect"]}
            rows={[
              ["Accept (green)", "You join that team. The page reloads showing your new team."],
              ["Decline (red)", "Invitation is removed. You remain un-teamed."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Team status meanings</h3>
          <GuideTable
            headers={["Status", "Meaning"]}
            rows={[
              ["forming", "Team is being assembled; slots are still open."],
              ["confirmed", "Team is locked by faculty. Proposals can now be submitted."],
              ["dissolved", "Team was disbanded. Members are no longer grouped."],
            ]}
          />

          <InfoBox type="warning">
            You can only be in one team at a time. Accepting one invitation automatically cancels all other pending invitations for you.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "proposals",
      title: "Proposals",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Proposals page (<code className="text-xs">/student/proposals</code>) lets your team submit and track project proposals.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Pre-conditions to submit</h3>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside mb-4">
            <li>You must be in a team.</li>
            <li>Your team status must be <StatusBadge label="confirmed" color="#15803d" bg="#f0fdf4" />.</li>
            <li>You must not already have an active proposal (<StatusBadge label="pending" color="#92400e" bg="#fef3c7" /> or <StatusBadge label="revision requested" color="#c2410c" bg="#fff7ed" />).</li>
          </ul>

          <InfoBox type="note">
            If the team is not yet confirmed, the page shows "Your team must be confirmed before submitting proposals." The <UiButton>New Proposal</UiButton> button is hidden.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-2">Submitting a proposal</h3>
          <Step num={1} title='Click "New Proposal"'>
            The proposal form expands on the same page.
          </Step>
          <Step num={2} title="Fill in the Title">
            Enter a clear project title (max 200 characters).
          </Step>
          <Step num={3} title="Write a Description">
            Describe the project clearly. This is a required multi-line text area.
          </Step>
          <Step num={4} title="Choose a Supervisor Faculty">
            Select the faculty member who will supervise your project from the dropdown.
          </Step>
          <Step num={5} title="Select Sustainable Development Goals (SDGs)">
            Check at least one SDG that your project aligns with. Each SDG shows a number and title. Selected SDGs are highlighted with a navy border.
          </Step>
          <Step num={6} title='Click "Submit"'>
            If all fields are valid, the proposal is submitted with status <StatusBadge label="pending" color="#92400e" bg="#fef3c7" />. The page reloads showing it in the proposals list.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Proposal statuses</h3>
          <GuideTable
            headers={["Status", "Meaning", "Your next action"]}
            rows={[
              ["pending", "Submitted and awaiting faculty review.", "Wait for faculty decision."],
              ["approved", "Faculty approved your proposal.", "Milestones and submission windows will appear."],
              ["rejected", "Faculty rejected. Rejection reason shown.", "Form a new proposal after reading the reason."],
              ["revision requested", "Faculty wants changes. Revision notes shown.", "Click 'Resubmit' link to submit a revised version."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Resubmitting a revised proposal</h3>
          <Step num={1} title="Find your proposal with 'revision requested' status">
            Revision notes from the faculty are shown in orange below the proposal description.
          </Step>
          <Step num={2} title='Click the "Resubmit →" link'>
            This takes you to <code className="text-xs">/student/proposals/{`{id}`}/resubmit</code>.
          </Step>
          <Step num={3} title="Edit and resubmit">
            Update the fields based on the revision notes and submit again.
          </Step>

          <InfoBox type="tip">
            Each resubmission increments the version number (v1, v2, …) shown beside the proposal title.
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
            The Milestones page (<code className="text-xs">/student/milestones</code>) shows a timeline of all project milestones set by your faculty supervisor.
          </p>

          <InfoBox type="note">
            Milestones only appear after your proposal is <StatusBadge label="approved" color="#15803d" bg="#f0fdf4" />. If no milestones exist yet, you see an empty-state message.
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3">Reading the milestone timeline</h3>
          <GuideTable
            headers={["Field", "Meaning"]}
            rows={[
              ["Milestone name", "Short name for this deliverable (e.g., 'Literature Review')."],
              ["Description", "What is expected for this milestone."],
              ["Deadline", "The date by which the milestone must be completed."],
              ["Status badge", "open / completed / missed."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Milestone status meanings</h3>
          <GuideTable
            headers={["Status", "Colour", "Meaning"]}
            rows={[
              ["open", "Amber", "Milestone is active. Submit your work through Submissions."],
              ["completed", "Green", "Faculty marked this milestone as done."],
              ["missed", "Red", "Deadline passed without a submission being accepted."],
            ]}
          />

          <InfoBox type="tip">
            Students cannot change milestone status directly. Upload your submissions on time - faculty marks milestones complete after reviewing them.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "submissions",
      title: "Submissions",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Submissions page (<code className="text-xs">/student/submissions</code>) is where you upload deliverables for each milestone.
          </p>

          <InfoBox type="note">
            This page is only populated once you have an approved proposal with milestones and at least one open submission window. Otherwise you see "No active milestones."
          </InfoBox>

          <h3 className="font-semibold text-neutral-800 mb-3">Page layout</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Each milestone appears as a card. Inside each card are the submission windows created by your faculty.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">Submission window states</h3>
          <GuideTable
            headers={["Badge", "Meaning"]}
            rows={[
              ["Window Open (green)", "You can upload files or submit a GitHub link right now."],
              ["Window Closed (grey)", "The window has passed. No new uploads accepted."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">What you can submit (per window)</h3>
          <GuideTable
            headers={["Type", "Accepted format", "How to submit"]}
            rows={[
              ["PPT", ".pptx or .ppt", "Click the file input in the PPT section and choose the file. Upload starts immediately."],
              ["Report", ".pdf only", "Click the file input in the Report section and choose the PDF."],
              ["GitHub Repository", "Valid GitHub URL", "Paste the URL and click Submit."],
            ]}
          />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Uploading a file</h3>
          <Step num={1} title="Ensure the window is open">
            The <StatusBadge label="Window Open" color="#15803d" bg="#f0fdf4" /> badge must be green. If it is grey, the window has closed.
          </Step>
          <Step num={2} title="Click the file input">
            For PPT section choose a .pptx or .ppt file. For Report section choose a .pdf file.
          </Step>
          <Step num={3} title="Wait for upload">
            "Uploading…" text appears. Do not navigate away.
          </Step>
          <Step num={4} title="Confirm submission">
            On success, a green <span className="text-xs text-green-600 font-medium">Submitted ✓</span> label appears. If you need to update, upload again while the window is still open.
          </Step>

          <h3 className="font-semibold text-neutral-800 mb-3 mt-4">Submitting a GitHub link</h3>
          <Step num={1} title="Find the GitHub Repository section in an open window">
            Below the PPT and Report sections.
          </Step>
          <Step num={2} title="Paste your repository URL">
            Format: <code className="text-xs bg-neutral-100 px-1 rounded">https://github.com/owner/repo</code>
          </Step>
          <Step num={3} title='Click "Submit"'>
            The link is saved. The current URL is shown in green for reference.
          </Step>

          <InfoBox type="warning">
            Once a submission window closes, existing submissions are locked. You cannot upload or update after the window closes.
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
            The Notifications page (<code className="text-xs">/student/notifications</code>) shows all system notifications sent to you - proposal decisions, milestone updates, and team events.
          </p>
          <h3 className="font-semibold text-neutral-800 mb-3">What triggers a notification</h3>
          <GuideTable
            headers={["Event", "Notification sent"]}
            rows={[
              ["Proposal approved", "Your proposal was approved."],
              ["Proposal rejected", "Your proposal was rejected with a reason."],
              ["Revision requested", "Faculty requests changes to your proposal."],
              ["Team invitation received", "You have been invited to join a team."],
              ["Milestone created", "A new milestone has been added to your project."],
            ]}
          />
          <InfoBox type="tip">
            Unread notifications are usually highlighted. Mark them as read by clicking on them (behaviour depends on your version of AcadeX).
          </InfoBox>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Profile",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            The Profile page (<code className="text-xs">/student/profile</code>) lets you update personal information.
          </p>
          <GuideTable
            headers={["Field", "Editable by student?", "Notes"]}
            rows={[
              ["Full name", "Yes", "Used across the portal for display."],
              ["Email", "No", "Managed by the administrator."],
              ["USN", "No", "Set by the administrator."],
              ["CGPA", "No", "Set by the administrator - affects team eligibility."],
              ["Password", "Via Forgot Password flow", "Use the forgot-password link on the login page."],
            ]}
          />
          <InfoBox type="note">
            If your CGPA or USN is incorrect, contact your department administrator. Students cannot edit these directly.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "workflow",
      title: "Complete Student Workflow",
      content: (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            This section shows the end-to-end flow from login to final submission.
          </p>

          <h3 className="font-semibold text-neutral-800 mb-3">System flow diagram</h3>
          <FlowRow steps={["Login (/login)", "Dashboard (/student)", "Join or Form Team (/student/teams)"]} />
          <FlowRow steps={["Team: forming", "Faculty confirms team", "Team: confirmed"]} />
          <FlowRow steps={["Submit Proposal (/student/proposals)", "Faculty reviews"]} />
          <FlowRow steps={["Proposal: approved", "Milestones created by faculty", "Submission windows open"]} />
          <FlowRow steps={["Upload PPT + Report + GitHub (/student/submissions)", "Milestone marked complete"]} />

          <h3 className="font-semibold text-neutral-800 mb-3 mt-6">Edge cases & what to do</h3>
          <GuideTable
            headers={["Situation", "Cause", "Resolution"]}
            rows={[
              ["Cannot see 'New Proposal' button", "Team not confirmed yet or already have active proposal.", "Wait for team confirmation or resolve the active proposal."],
              ["Join button is disabled for all teams", "Your CGPA does not meet any slot requirement.", "Form your own team or ask your advisor."],
              ["Submission window is missing", "Faculty has not created a window for that milestone.", "Contact your faculty supervisor."],
              ["File upload fails", "Wrong file type or server error shown.", "Check file format (.pptx/.ppt for PPT; .pdf for report) and retry."],
              ["Proposal stuck at 'pending'", "Faculty has not reviewed it yet.", "Check notifications for updates or contact faculty."],
              ["Cannot invite a student", "All section mates already invited or team is confirmed.", "Team is full or locked; no further invitations possible."],
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
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar navigation */}
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

        {/* Content area */}
        <main className="flex-1 min-w-0">
          {sections.map((s) =>
            s.id === activeSection ? (
              <div key={s.id}>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">{s.title}</h2>
                <div
                  className="mb-6 h-1 w-16 rounded"
                  style={{ backgroundColor: "#1e3a5f" }}
                />
                {s.content}
              </div>
            ) : null
          )}
        </main>
      </div>
    </div>
  );
}
