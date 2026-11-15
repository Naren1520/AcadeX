"use client";

import {
  GuideShell, StepList, InfoBox, RuleTable,
  SectionHeading, StatusPill, VerticalTimeline, LabelledFlow,
} from "@/components/guide/GuideComponents";
import {
  IconDashboard, IconUsers, IconFileText,
  IconFlag, IconUpload, IconSettings, IconBell, IconCheck,
} from "@/components/ui/Icon";

function IconClipboard({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function StudentGuideClient() {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: <IconDashboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Student portal takes you through the full project lifecycle — forming a team, submitting a proposal, tracking milestones, and uploading deliverables.
          </p>

          <div>
            <SectionHeading>Your journey at a glance</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Login",             sublabel: "Use credentials from admin or onboarding",       color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Join or Form Team", sublabel: "Browse existing teams or create your own",       color: "#0369a1", bg: "#f0f9ff" },
                { label: "Team Confirmed",    sublabel: "Faculty locks the team",                         color: "#d97706", bg: "#fffbeb" },
                { label: "Submit Proposal",   sublabel: "Choose a supervisor, pick SDGs",                 color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Proposal Approved", sublabel: "Faculty approves",                               color: "#16a34a", bg: "#f0fdf4" },
                { label: "Track Milestones",  sublabel: "Deadlines set by faculty",                       color: "#0369a1", bg: "#f0f9ff" },
                { label: "Upload Deliverables", sublabel: "PPT + Report + GitHub within submission windows", color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
              ]} />
            </div>
          </div>

          <InfoBox type="note">
            Student accounts are created by your administrator or through a faculty onboarding invitation link. You cannot self-register directly.
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
            { title: "Go to /login", body: "Open the AcadeX login page." },
            { title: "Enter your email and password", body: "Use the credentials provided by your administrator or set during onboarding." },
            { title: "Click Sign In", body: "You are redirected to /student (the Student Dashboard)." },
            { title: "Forgot password", body: "Click the forgot-password link. A reset email is sent to your registered address." },
          ]} />

          <RuleTable
            headers={["Situation", "Result"]}
            rows={[
              ["Wrong credentials",         "Error shown — account not locked."],
              ["Account not created",       "Login fails. Contact your faculty or admin."],
              ["Student visits /faculty",   "Redirected to /student automatically."],
              ["Session expires",           "Redirected to /login automatically."],
            ]}
          />
        </div>
      ),
    },
    {
      id: "teams",
      title: "My Team",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            You must be in a confirmed team before you can submit proposals. The Teams page handles everything from forming a team to accepting invitations.
          </p>

          <div>
            <SectionHeading>Two ways to join a team</SectionHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#1e3a5f" }}>Join an existing team</p>
                <LabelledFlow steps={[
                  { label: "Browse teams", color: "#1e3a5f" },
                  { label: "CGPA check", color: "#1e3a5f" },
                  { label: "Click Join", color: "#16a34a" },
                ]} />
                <p className="mt-2 text-xs text-neutral-500">The Join button is active only if your CGPA fits an open slot.</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#16a34a" }}>Form a new team</p>
                <LabelledFlow steps={[
                  { label: "Pick a rule", color: "#16a34a" },
                  { label: "Name the team", color: "#16a34a" },
                  { label: "You're the Lead", color: "#16a34a" },
                ]} />
                <p className="mt-2 text-xs text-neutral-500">As Lead you can invite section mates.</p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading>Team status lifecycle</SectionHeading>
            <div className="mt-3">
              <LabelledFlow steps={[
                { label: "forming",   sublabel: "assembling members", color: "#1e3a8a" },
                { label: "confirmed", sublabel: "locked by faculty",  color: "#16a34a" },
                { label: "dissolved", sublabel: "disbanded",          color: "#6b7280" },
              ]} />
            </div>
          </div>

          <div>
            <SectionHeading>Inviting students (Team Lead only)</SectionHeading>
            <StepList steps={[
              { title: "Click Invite a Student", body: "Only shown when you are the lead and the team is in forming status." },
              { title: "Pick a section mate from the dropdown", body: "Only eligible, uninvited section mates appear." },
              { title: "Click Send Invitation", body: "The student sees an accept/decline banner on their Teams page." },
            ]} />
          </div>

          <InfoBox type="warning">
            You can only be in one team at a time. Accepting an invitation cancels all other pending invitations you have.
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
            Once your team is confirmed you can submit a project proposal to a faculty supervisor.
          </p>

          <div>
            <SectionHeading>Pre-conditions checklist</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {[
                "You must be in a team",
                "Team status must be confirmed",
                "No active proposal in pending or revision_requested state",
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: "#16a34a" }}>
                    <IconCheck size={10} />
                  </span>
                  <span className="text-sm text-neutral-700">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading>Proposal lifecycle</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Submit proposal",       sublabel: "status: pending",                 color: "#d97706", bg: "#fffbeb" },
                { label: "Faculty reviews",       sublabel: "approve / reject / request revision", color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Approved",              sublabel: "milestones become visible",       color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
                { label: "Rejected",              sublabel: "read the reason, submit a new one", color: "#dc2626", bg: "#fef2f2" },
                { label: "Revision requested",    sublabel: "edit and resubmit — version increments", color: "#7c3aed", bg: "#f5f3ff" },
              ]} />
            </div>
          </div>

          <div>
            <SectionHeading>Submitting</SectionHeading>
            <StepList steps={[
              { title: "Click New Proposal", body: "The form expands on the page." },
              { title: "Enter title and description", body: "Title max 200 chars. Description explains the project." },
              { title: "Choose a faculty supervisor", body: "Select from faculty in your section." },
              { title: "Select SDGs", body: "Pick at least one Sustainable Development Goal." },
              { title: "Click Submit", body: "Proposal created with status pending." },
            ]} />
          </div>

          <InfoBox type="tip">
            Each resubmission increments the version number (v1, v2…) shown beside the proposal title.
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
            Milestones are set by your faculty after your proposal is approved. The Milestones page shows a timeline with names, descriptions, deadlines, and statuses.
          </p>

          <div>
            <SectionHeading>Milestone status meanings</SectionHeading>
            <div className="mt-3 flex flex-col gap-2">
              {([
                ["Open",      "pending",  "Active — submit your work before the deadline."],
                ["Completed", "approved", "Faculty marked this done after reviewing your upload."],
                ["Missed",    "rejected", "Deadline passed without an accepted submission."],
              ] as [string, "pending"|"approved"|"rejected", string][]).map(([label, v, desc]) => (
                <div key={label} className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                  <StatusPill label={label} variant={v} />
                  <span className="text-xs text-neutral-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <InfoBox type="note">
            Students cannot change milestone status. Upload your work on time — faculty marks milestones complete.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "submissions",
      title: "Submissions",
      icon: <IconUpload size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Submissions page is where you upload deliverables within the time windows opened by your faculty.
          </p>

          <div>
            <SectionHeading>What you can submit per window</SectionHeading>
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

          <div>
            <SectionHeading>Upload steps</SectionHeading>
            <StepList steps={[
              { title: "Find the milestone and open window", body: <><StatusPill label="Window Open" variant="approved" /> badge must be green. Grey = window closed.</> },
              { title: "Click the file input", body: "Choose the correct file type (.pptx for PPT, .pdf for report)." },
              { title: "Wait for upload", body: "'Uploading…' text appears. Do not navigate away." },
              { title: "Confirm", body: "A green Submitted ✓ label appears. Upload again while the window is open if you need to update." },
            ]} />
          </div>

          <InfoBox type="warning">
            Once a window closes, uploads are locked. No changes accepted after closure.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Profile",
      icon: <IconSettings size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Your profile is visible to faculty when reviewing team compositions and onboarding submissions.
          </p>

          <RuleTable
            headers={["Field", "Editable?", "Notes"]}
            rows={[
              ["Full name",  "No",                   "Set by admin."],
              ["Email",      "No",                   "Managed by admin."],
              ["USN",        "No",                   "Affects CGPA display. Contact admin to change."],
              ["CGPA",       "No",                   "Affects team slot eligibility. Contact admin to change."],
              ["GitHub URL", "Yes",                  "Visible to faculty in team dashboards."],
              ["Skills",     "Yes (max 20)",          "Visible during onboarding review."],
              ["Resume",     "Yes (PDF, max 20 MB)", "Visible to faculty."],
              ["Password",   "Via forgot-password",  "Use the link on the login page."],
            ]}
          />

          <InfoBox type="note">
            If your CGPA or USN is incorrect, contact your department administrator. You cannot edit these yourself.
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
            Notifications appear in-app and are also emailed to you for important events.
          </p>

          <RuleTable
            headers={["Event", "Notification sent to you"]}
            rows={[
              ["Proposal approved",          "Your proposal was approved by faculty."],
              ["Proposal rejected",          "Your proposal was rejected — reason included."],
              ["Revision requested",         "Faculty requests changes to your proposal."],
              ["Team invitation received",   "Another team lead has invited you to join."],
              ["Milestone deadline reminder","Upcoming deadline approaching (sent 3 days before)."],
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
          <p className="text-sm text-neutral-600">End-to-end flow from first login to final submission.</p>

          <div>
            <SectionHeading>Full student timeline</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Receive credentials",       sublabel: "from admin or onboarding link",        color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Login",                     sublabel: "/login → /student",                   color: "#0369a1", bg: "#f0f9ff" },
                { label: "Join or form a team",       sublabel: "/student/teams",                      color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Invite team members",       sublabel: "Lead only — section mates",           color: "#d97706", bg: "#fffbeb" },
                { label: "Faculty confirms team",     sublabel: "status: forming → confirmed",         color: "#0369a1", bg: "#f0f9ff" },
                { label: "Submit proposal",           sublabel: "/student/proposals",                  color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Proposal approved",         sublabel: "faculty reviews",                     color: "#16a34a", bg: "#f0fdf4" },
                { label: "Track milestones",          sublabel: "/student/milestones",                 color: "#0369a1", bg: "#f0f9ff" },
                { label: "Upload deliverables",       sublabel: "/student/submissions",                color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Milestone marked complete", sublabel: "faculty action — cycle ends",         color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
              ]} />
            </div>
          </div>

          <SectionHeading>Common issues</SectionHeading>
          <RuleTable
            headers={["Problem", "Cause", "Fix"]}
            rows={[
              ["New Proposal button not visible",  "Team not confirmed or existing active proposal", "Wait for confirmation or resolve the existing proposal"],
              ["Join button disabled on all teams","CGPA does not meet any slot requirement",        "Form your own team"],
              ["No submission window shown",       "Faculty has not opened a window",               "Contact your faculty supervisor"],
              ["File upload fails",                "Wrong file type",                               "Check format: .pptx/.ppt for PPT, .pdf for report"],
            ]}
          />
        </div>
      ),
    },
  ];

  return <GuideShell sections={sections} />;
}
