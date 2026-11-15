"use client";

import {
  GuideShell, StepList, InfoBox, FlowDiagram, RuleTable,
  SectionHeading, StatusPill, VerticalTimeline, HierarchyTree,
  PermissionMatrix, LabelledFlow,
} from "@/components/guide/GuideComponents";
import {
  IconDashboard, IconSettings, IconUsers, IconFileText,
  IconBell, IconClipboard, IconFlag, IconCheck,
} from "@/components/ui/Icon";

export function AdminGuideClient() {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: <IconDashboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Admin portal is the control plane for AcadeX. You manage the full institutional structure and control who can access the platform.
          </p>

          <div>
            <SectionHeading>Platform hierarchy</SectionHeading>
            <div className="mt-3">
              <HierarchyTree root={{
                label: "Department", example: "Computer Science", color: "#1e3a5f", bg: "#eff6ff",
                children: [{
                  label: "Academic Year", example: "2024–25", color: "#0369a1", bg: "#f0f9ff",
                  children: [{
                    label: "Semester", example: "Odd 2024", color: "#7c3aed", bg: "#f5f3ff",
                    children: [
                      {
                        label: "Section CS-A", example: "students + faculty", color: "#16a34a", bg: "#f0fdf4",
                        children: [],
                      },
                      {
                        label: "Section CS-B", example: "students + faculty", color: "#16a34a", bg: "#f0fdf4",
                        children: [],
                      },
                    ],
                  }],
                }],
              }} />
            </div>
          </div>

          <div>
            <SectionHeading>What admins can do</SectionHeading>
            <div className="mt-3">
              <PermissionMatrix
                features={[
                  "Create departments",
                  "Create faculty accounts",
                  "Create student accounts",
                  "Assign faculty to sections",
                  "Create academic years & semesters",
                  "View audit logs",
                  "Create team formation rules",
                  "Review proposals",
                  "Create milestones",
                ]}
                roles={[
                  { label: "Admin",   color: "#1e3a5f" },
                  { label: "Faculty", color: "#7c3aed" },
                  { label: "Student", color: "#16a34a" },
                ]}
                matrix={[
                  [true,  false, false],
                  [true,  false, false],
                  [true,  true,  false],
                  [true,  false, false],
                  [true,  false, false],
                  [true,  false, false],
                  [false, true,  false],
                  [false, true,  false],
                  [false, true,  false],
                ]}
              />
            </div>
          </div>

          <InfoBox type="note">
            Admin accounts are seeded directly in the database by a system operator. They cannot be self-registered.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "departments",
      title: "Departments",
      icon: <IconSettings size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Departments are the top level of the hierarchy. Everything — semesters, sections, students, faculty — belongs to a department.
          </p>

          <div>
            <SectionHeading>Drill-down path</SectionHeading>
            <div className="mt-3">
              <LabelledFlow steps={[
                { label: "Departments", sublabel: "e.g. CSE, ECE" },
                { label: "Academic Year", sublabel: "e.g. 2024–25" },
                { label: "Semester", sublabel: "e.g. Odd 2024" },
                { label: "Section", sublabel: "e.g. CS-A" },
                { label: "Students + Faculty", sublabel: "enrolled here", color: "#16a34a" },
              ]} />
            </div>
          </div>

          <SectionHeading>Creating a department</SectionHeading>
          <StepList steps={[
            { title: "Go to Departments", body: "Click Departments in the sidebar." },
            { title: "Click Add Department", body: "A dialog opens asking for name and code." },
            { title: "Enter name and code", body: <><strong>Name</strong> — full name (e.g. Computer Science). <strong>Code</strong> — short identifier max 10 chars (e.g. CS, ECE).</> },
            { title: "Submit", body: "Department appears in the table with status Active." },
          ]} />

          <InfoBox type="warning">
            Deactivating a department hides it from new assignments but does not delete existing data.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "academic-years",
      title: "Academic Years",
      icon: <IconClipboard size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Academic years are shared across all departments. Each year holds semesters, and each semester holds sections per department.
          </p>

          <div>
            <SectionHeading>Setup timeline</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Create Academic Year", sublabel: "e.g. 2024–25", description: "Academic Years page → Add Year.", color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Open a Department", sublabel: "e.g. Computer Science", description: "Departments → click department row.", color: "#0369a1", bg: "#f0f9ff" },
                { label: "Add a Semester", sublabel: "e.g. Odd 2024", description: "Department page → Add Semester.", color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Add Sections", sublabel: "e.g. CS-A, CS-B", description: "Semester page → Add Section.", color: "#d97706", bg: "#fffbeb" },
                { label: "Assign Faculty & Enrol Students", sublabel: "section is live", description: "Section detail page → use the faculty and student panels.", color: "#16a34a", bg: "#f0fdf4" },
              ]} />
            </div>
          </div>

          <RuleTable
            headers={["Action", "Who can do it"]}
            rows={[
              ["Create / close academic year",    "Admin only"],
              ["Create / close semester",         "Admin only"],
              ["Create section",                  "Admin only"],
              ["Add students to section",         "Admin, or Faculty with 'can manage students' permission"],
              ["Assign faculty to section",       "Admin only"],
            ]}
          />
        </div>
      ),
    },
    {
      id: "users",
      title: "Users",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Users page lets you create and manage faculty accounts. Students are created separately via the Students page or onboarding invitation links.
          </p>

          <div>
            <SectionHeading>Account creation paths</SectionHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#7c3aed" }}>Faculty</p>
                <LabelledFlow steps={[
                  { label: "Users page", color: "#7c3aed" },
                  { label: "Create User", color: "#7c3aed" },
                  { label: "Role: Faculty", color: "#16a34a" },
                ]} />
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#16a34a" }}>Students</p>
                <LabelledFlow steps={[
                  { label: "Section page", color: "#16a34a" },
                  { label: "Add / Bulk Upload", color: "#16a34a" },
                  { label: "Account created", color: "#16a34a" },
                ]} />
              </div>
            </div>
          </div>

          <SectionHeading>Creating a faculty account</SectionHeading>
          <StepList steps={[
            { title: "Go to Users", body: "Click Users in the sidebar." },
            { title: "Click Create User", body: "A dialog opens." },
            { title: "Fill in name, email, and password", body: "Email must be unique platform-wide. Password minimum 8 characters." },
            { title: "Set role to Faculty", body: "The role field defaults to faculty on this page." },
            { title: "Submit", body: "Account created. Faculty can now log in." },
          ]} />

          <InfoBox type="tip">
            After creating faculty accounts you must assign them to sections via Faculty Assignments or the section detail page.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "faculty-assignments",
      title: "Faculty Assignments",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Faculty assignments connect a faculty member to a section. A faculty can be assigned to multiple sections across multiple departments.
          </p>

          <div>
            <SectionHeading>Permission levels</SectionHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>View only</span>
                </div>
                <p className="text-xs text-neutral-600">Can view section students and teams. Cannot add or remove students.</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#dcfce7", color: "#14532d", border: "1px solid #bbf7d0" }}>Can manage students</span>
                </div>
                <p className="text-xs text-neutral-600">Can add, remove, and bulk-upload students in the section.</p>
              </div>
            </div>
          </div>

          <StepList steps={[
            { title: "Go to Faculty Assignments", body: "Click Faculty Assignments in the sidebar." },
            { title: "Click Assign Faculty", body: "A dialog opens." },
            { title: "Select the faculty member and section", body: "Choose from existing faculty accounts and available sections." },
            { title: "Toggle can manage students", body: "Enable if the faculty should be able to enrol students." },
            { title: "Submit", body: "Assignment appears in the table." },
          ]} />
        </div>
      ),
    },
    {
      id: "students",
      title: "Students",
      icon: <IconUsers size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            The Students page shows all student accounts. You can search, filter by department or section, and view individual student details.
          </p>

          <div>
            <SectionHeading>How students are created</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Method 1 — Admin adds directly", sublabel: "Section page → Add Student or Bulk Upload", description: "Creates the account and enrols the student in the section at the same time.", color: "#1e3a5f", bg: "#eff6ff", icon: <span className="text-xs font-bold">A</span> },
                { label: "Method 2 — Onboarding invitation", sublabel: "Faculty creates a time-limited link", description: "Student visits link, fills form, faculty approves submission → account created.", color: "#16a34a", bg: "#f0fdf4", icon: <span className="text-xs font-bold">B</span> },
              ]} />
            </div>
          </div>

          <InfoBox type="note">
            Only admins can edit a student's USN or CGPA after the account is created. Students cannot change these themselves.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "audit-logs",
      title: "Audit Logs",
      icon: <IconFileText size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Every significant action on the platform is recorded — who did what, when, and to which record.
          </p>

          <RuleTable
            headers={["Event type", "Example"]}
            rows={[
              ["User created",                      "Admin created faculty account john@college.edu"],
              ["Section assignment changed",         "Student moved from CS-A to CS-B"],
              ["Faculty assignment added / removed", "Faculty assigned to ECE-B"],
              ["Proposal approved / rejected",       "Proposal 'AI for Health' approved"],
              ["Milestone created / updated",        "Deadline changed for Mid-Term Review"],
              ["Email delivery failed",              "Email failed after 4 retry attempts"],
            ]}
          />

          <InfoBox type="warning">
            Audit logs are read-only. No entry can be edited or deleted by any role.
          </InfoBox>
        </div>
      ),
    },
    {
      id: "workflow",
      title: "Complete Workflow",
      icon: <IconFlag size={14} />,
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-600">
            Recommended order to set up a new academic cycle from scratch.
          </p>

          <div>
            <SectionHeading>Full setup timeline</SectionHeading>
            <div className="mt-3">
              <VerticalTimeline nodes={[
                { label: "Create departments",        sublabel: "CSE, ECE, ME…",                     color: "#1e3a5f", bg: "#eff6ff" },
                { label: "Create academic year",      sublabel: "e.g. 2024–25",                      color: "#0369a1", bg: "#f0f9ff" },
                { label: "Create faculty accounts",   sublabel: "Users page → Create User",          color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Open semesters & sections", sublabel: "Dept → Year → Semester → Section",  color: "#d97706", bg: "#fffbeb" },
                { label: "Assign faculty to sections",sublabel: "Faculty Assignments page",           color: "#dc2626", bg: "#fef2f2" },
                { label: "Enrol students",            sublabel: "Add Student or Bulk Upload",         color: "#16a34a", bg: "#f0fdf4" },
                { label: "Platform is live",          sublabel: "Faculty and students can log in",    color: "#16a34a", bg: "#f0fdf4",
                  icon: <IconCheck size={12} style={{ color: "#fff" }} /> },
              ]} />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <GuideShell sections={sections} />;
}
