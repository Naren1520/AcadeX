export interface LifecycleStage {
  step: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyPoints: string[];
  preview: {
    type: string;
    badge: string;
    badgeType: "approved" | "pending";
    rows: { label: string; val: string }[];
  };
}

export interface RoleInfo {
  role: string;
  target: string;
  tagline: string;
  description: string;
  iconType: "student" | "faculty" | "admin";
  features: string[];
  ctaText: string;
}

export interface Capability {
  title: string;
  desc: string;
  iconType: "users" | "fileText" | "flag" | "upload" | "settings" | "check";
}

export interface FaqItem {
  q: string;
  a: string;
}

export const stats = [
  { value: "100%", label: "Audit Trail", desc: "Every action logged with actor ID and timestamp" },
  { value: "17 Goals", label: "UN SDG Aligned", desc: "Structured tagging for national accreditation" },
  { value: "3-Tier", label: "Role Hierarchy", desc: "Dedicated student, faculty, and admin access" },
  { value: "0 Loss", label: "Artefact Tracking", desc: "Direct GitHub, PPT, and PDF verification" },
];

export const lifecycleStages: LifecycleStage[] = [
  {
    step: "01",
    id: "formation",
    title: "Team Formation & Eligibility",
    subtitle: "Rule-enforced student collaboration",
    description:
      "Students assemble teams within department parameters. The system automatically enforces CGPA balancing, minimum and maximum team sizes, and section boundaries to guarantee fair collaboration.",
    keyPoints: [
      "Real-time CGPA threshold validation",
      "Section and batch boundary constraints",
      "Secure invitation and acceptance flow",
    ],
    preview: {
      type: "Team Roster Verification",
      badge: "Eligibility: Passed",
      badgeType: "approved",
      rows: [
        { label: "Team Name", val: "NeuralSync Solutions" },
        { label: "Average CGPA", val: "8.42 (Required: 7.0 - 9.5)" },
        { label: "Members", val: "4 / 4 Students Assigned" },
        { label: "Section", val: "CSE - Semester VII (Batch A)" },
      ],
    },
  },
  {
    step: "02",
    id: "proposals",
    title: "SDG Alignment & Proposal Defense",
    subtitle: "Formal project synopsis review",
    description:
      "Teams submit structured project proposals featuring problem statements, methodology, tech stack, and alignment with UN Sustainable Development Goals for guide evaluation.",
    keyPoints: [
      "Mandatory UN SDG classification",
      "Inline faculty feedback and revision requests",
      "Multi-round version-tracked resubmission",
    ],
    preview: {
      type: "Proposal Evaluation Matrix",
      badge: "Status: Guide Approved",
      badgeType: "approved",
      rows: [
        { label: "Title", val: "Autonomous Quadcopter for Disaster Relief" },
        { label: "UN SDG", val: "Goal 9: Industry, Innovation & Infrastructure" },
        { label: "Guide Status", val: "Prof. K. Ramanathan (Approved)" },
        { label: "Remarks", val: "Scope validated. Hardware BOM verified." },
      ],
    },
  },
  {
    step: "03",
    id: "milestones",
    title: "Milestone Scheduling & Windows",
    subtitle: "Strict deadline and window control",
    description:
      "Department coordinators schedule milestones across the semester. Submission windows define opening dates, deadlines, and accepted artefact types.",
    keyPoints: [
      "Configurable opening and closing deadlines",
      "Automated late submission detection",
      "Synchronized milestone dates across sections",
    ],
    preview: {
      type: "Milestone Window #2",
      badge: "Window: Open",
      badgeType: "pending",
      rows: [
        { label: "Deliverable", val: "SRS Document & System Architecture" },
        { label: "Deadline", val: "15 November 2026, 23:59 IST" },
        { label: "Accepted Formats", val: "PDF Report + GitHub Repo URL" },
        { label: "Submissions", val: "38 of 42 Teams Submitted" },
      ],
    },
  },
  {
    step: "04",
    id: "artefacts",
    title: "Artefacts & GitHub Verification",
    subtitle: "Centralized deliverable archiving",
    description:
      "Students submit deliverables directly to cloud storage. AcadeX securely captures GitHub repository links, documentation PDFs, and presentation decks.",
    keyPoints: [
      "Repository URL validation and branch logging",
      "Direct file upload with size limits",
      "Version history preserving previous uploads",
    ],
    preview: {
      type: "Artefact Repository Record",
      badge: "Verified",
      badgeType: "approved",
      rows: [
        { label: "GitHub URL", val: "github.com/acadex-org/team-neuralsync" },
        { label: "Presentation", val: "Mid_Term_Review_Deck.pdf (14.2 MB)" },
        { label: "Source Code", val: "Commit sha: 8f3c19b recorded" },
        { label: "Upload Time", val: "24 Oct 2026, 16:32 IST" },
      ],
    },
  },
  {
    step: "05",
    id: "grading",
    title: "Evaluation & Viva Grading",
    subtitle: "Standardized rubric scoring",
    description:
      "Examiners and mentors enter marks against predefined rubrics. AcadeX consolidates internal scores, guide feedback, and viva marks into exportable grade sheets.",
    keyPoints: [
      "Criterion-based rubric scoring",
      "Mentor and external examiner split marks",
      "Automated grade compilation and export",
    ],
    preview: {
      type: "Evaluation Grade Record",
      badge: "Marks Locked",
      badgeType: "approved",
      rows: [
        { label: "Evaluation Stage", val: "Phase-1 Internal Viva Assessment" },
        { label: "Guide Assessment", val: "28 / 30 (Exceeds Expectations)" },
        { label: "Viva Committee", val: "45 / 50 (Demonstrated Working Model)" },
        { label: "Final Grade", val: "91% (Grade A+ Recorded)" },
      ],
    },
  },
];

export const roles: RoleInfo[] = [
  {
    role: "Students",
    target: "/student/guide",
    tagline: "Collaborative project portal",
    description:
      "Manage the entire capstone journey from a clean dashboard. Form qualified teams, submit SDG proposals, track milestones, and receive faculty remarks.",
    iconType: "student",
    features: [
      "Team formation with CGPA rule validation",
      "SDG selection and proposal drafting",
      "Milestone countdown and submission portal",
      "Peer invitations and status notifications",
    ],
    ctaText: "Explore Student Guide",
  },
  {
    role: "Faculty Mentors",
    target: "/faculty/guide",
    tagline: "Comprehensive mentorship tools",
    description:
      "Review student proposals, offer targeted comments, enforce deadlines, and record rubric-based evaluation scores for assigned project batches.",
    iconType: "faculty",
    features: [
      "Single-click proposal approval or revision",
      "Configurable milestone submission windows",
      "Section and mentee progress monitoring",
      "Marks entry against academic rubrics",
    ],
    ctaText: "Explore Faculty Guide",
  },
  {
    role: "Administrators & Deans",
    target: "/login",
    tagline: "Department-wide governance",
    description:
      "Oversee institutional academic structure, configure faculty workload allocations, manage semesters and sections, and inspect tamper-resistant audit logs.",
    iconType: "admin",
    features: [
      "Academic year, semester, and section setup",
      "Faculty assignment and mentee allocation",
      "Immutable system-wide audit logging",
      "Bulk student and faculty provisioning",
    ],
    ctaText: "Sign In to Admin Portal",
  },
];

export const capabilities: Capability[] = [
  {
    title: "CGPA-Balanced Formation",
    desc: "Enforce departmental criteria to ensure balanced team capabilities and fair academic collaboration across all sections.",
    iconType: "users",
  },
  {
    title: "Tamper-Resistant Audit Trail",
    desc: "Every proposal approval, revision request, score submission, and deadline modification is permanently logged with actor details.",
    iconType: "fileText",
  },
  {
    title: "17 UN SDG Integrations",
    desc: "Mandatory alignment tagging allows departments to categorize and report academic innovations for NAAC and NBA accreditations.",
    iconType: "flag",
  },
  {
    title: "Configurable Deadlines",
    desc: "Set precise open and close windows with automatic late-submission indicators and individual extension controls.",
    iconType: "upload",
  },
  {
    title: "Role-Based Row Security",
    desc: "Strict Supabase Row-Level Security ensures students access only their team, faculty view assigned mentees, and admins govern centrally.",
    iconType: "settings",
  },
  {
    title: "Production Documentation",
    desc: "Comprehensive built-in guides for students and faculty documenting every button, workflow step, edge case, and policy.",
    iconType: "check",
  },
];

export const faqs: FaqItem[] = [
  {
    q: "How does CGPA-based team formation work?",
    a: "Faculty coordinators configure team formation criteria per section, including minimum/maximum team sizes and average CGPA brackets. When students send invitations, the platform calculates combined eligibility in real time and prevents invalid combinations.",
  },
  {
    q: "Can a proposal be revised after submission?",
    a: "Yes. If a faculty mentor requests changes, the proposal status switches to Revision Required. Students receive the mentor's specific feedback and can update their abstract, methodology, or SDG alignment without creating duplicate entries.",
  },
  {
    q: "What types of deliverables can be uploaded for milestones?",
    a: "Milestone windows can accept project report PDFs, presentation slide decks (PDF/PPTX), and validated GitHub repository URLs. Every submission records commit hashes and timestamps for institutional verification.",
  },
  {
    q: "How does AcadeX maintain data security and compliance?",
    a: "AcadeX utilizes Supabase PostgreSQL with strict Row-Level Security (RLS), HTTPS encryption, HTTP-only authentication tokens, and a complete audit log. We do not use third-party advertising or analytics cookies.",
  },
  {
    q: "Are user guides available for students and faculty?",
    a: "Yes. AcadeX features dedicated, mobile-friendly Student and Faculty Guides accessible directly from the portal, complete with step-by-step procedures, button references, and edge-case guidance.",
  },
];
