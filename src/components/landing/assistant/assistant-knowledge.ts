export interface QuickAction {
  id: string;
  label: string;
  badge?: string;
  query: string;
}

export interface AssistantResponse {
  title?: string;
  text: string;
  highlights?: string[];
  links?: { label: string; href?: string; actionId?: string }[];
  isContactPrompt?: boolean;
}

export const INITIAL_GREETING: AssistantResponse = {
  text: "Hello! I'm your AcadeX Assistant. I can explain the platform, break down the evaluation phases, or help you contact the project coordinators.",
  highlights: [
    "No spreadsheets, 100% auditable academic workflow",
    "Tailored for students, guides & coordinators",
  ],
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "what-is-acadex",
    label: "What is AcadeX?",
    query: "What is AcadeX?",
  },
  {
    id: "review-phases",
    label: "Evaluation Rubrics & Phases",
    badge: "0 - 4",
    query: "How do evaluation phases work?",
  },
  {
    id: "roles-access",
    label: "Roles & Portals",
    query: "What roles are supported in AcadeX?",
  },
  {
    id: "team-info",
    label: "Who built AcadeX?",
    query: "Who is the team behind this project?",
  },
  {
    id: "login-help",
    label: "Login & Access Help",
    query: "How do I sign in or get access?",
  },
  {
    id: "contact-form",
    label: "Leave a Query / Contact",
    badge: "Direct",
    query: "I want to contact the team",
  },
];

export const KNOWLEDGE_BASE: Record<string, AssistantResponse> = {
  "what-is-acadex": {
    title: "About AcadeX",
    text: "AcadeX is an enterprise-grade Academic Project Governance & Evaluation Platform engineered at Sahyadri College of Engineering & Management (ISE Dept). It replaces chaotic manual spreadsheets, lost email threads, and WhatsApp approvals with a unified, transparent digital workflow.",
    highlights: [
      "Real-time Phase 0 to 4 rubric evaluations with automated grade computation",
      "Git commit & milestone tracking with guide sign-offs",
      "Immutable audit log compliant with VTU / NBA academic accreditation standards",
    ],
    links: [
      { label: "See Evaluation Phases", actionId: "review-phases" },
      { label: "Explore Roles", actionId: "roles-access" },
    ],
  },
  "review-phases": {
    title: "Review Rubrics & Evaluation Timeline",
    text: "AcadeX orchestrates academic capstone projects through five structured milestones with multi-criteria rubric scoring:",
    highlights: [
      "Phase 0 (Synopsis): Problem definition, literature feasibility, guide allocation",
      "Phase 1 (SRS & Design): Requirements specification, system architecture & UML",
      "Phase 2 (Mid-Term): 50% implementation check, GitHub progress audit & live code demo",
      "Phase 3 (Final Defense): Complete system deployment, testing coverage & evaluation",
      "Phase 4 (Documentation): Plagiarism check, IEEE format final report & external viva",
    ],
    links: [
      { label: "Who is the Supervisor?", actionId: "team-info" },
      { label: "Contact Coordinator", actionId: "contact-form" },
    ],
  },
  "roles-access": {
    title: "Role-Based Portals in AcadeX",
    text: "The platform provides strict zero-trust permission boundaries across three distinct stakeholder portals:",
    highlights: [
      "Student Portal: Form teams (2-4 peers), track guide approvals, submit reports, and view granular rubric feedback",
      "Faculty Guide Portal: Review synopsis drafts, assign milestone deadlines, verify git repositories, and score deliverables",
      "HOD & Coordinator Portal: Department-wide scheduling, external examiner assignment, batch analytics, and exportable grade books",
    ],
    links: [
      { label: "Login Instructions", actionId: "login-help" },
      { label: "Ask a Question", actionId: "contact-form" },
    ],
  },
  "naren-info": {
    title: "About Naren S J",
    text: "Naren S J is the lead developer of AcadeX from the Department of Information Science & Engineering (ISE Batch 2026) at Sahyadri College of Engineering & Management, building academic governance and review workflows under the mentorship of Dr. Rithesh Pakkala P.",
    highlights: [
      "Role: Lead Developer & Full-Stack Architect",
      "Department: Information Science & Engineering (ISE)",
      "LinkedIn: linkedin.com/in/narensj20",
    ],
    links: [
      { label: "Naren's LinkedIn Profile", href: "https://www.linkedin.com/in/narensj20/" },
      { label: "About Mentor (Dr. Rithesh Pakkala)", actionId: "mentor-info" },
      { label: "Leave a message for the team", actionId: "contact-form" },
    ],
  },
  "mentor-info": {
    title: "About Dr. Rithesh Pakkala P (Mentor / Supervisor)",
    text: "Dr. Rithesh Pakkala Permanki Guthu is the Project Supervisor, Mentor, and Senior Faculty in the Department of Information Science & Engineering (ISE) at Sahyadri College of Engineering & Management, leading academic project governance, review rubrics, and engineering architecture.",
    highlights: [
      "Role: Project Supervisor & Mentor / Academic Coordinator",
      "Department: Information Science & Engineering (ISE), Sahyadri College",
      "LinkedIn: linkedin.com/in/dr-rithesh-pakkala-permanki-guthu-537b07",
    ],
    links: [
      {
        label: "Dr. Rithesh Pakkala's LinkedIn Profile",
        href: "https://www.linkedin.com/in/dr-rithesh-pakkala-permanki-guthu-537b07",
      },
      { label: "About Naren S J", actionId: "naren-info" },
      { label: "Leave a message for Mentor", actionId: "contact-form" },
    ],
  },
  "team-info": {
    title: "Project Engineering & Supervision",
    text: "AcadeX is developed as a capstone initiative under the Department of Information Science & Engineering (ISE) at Sahyadri College of Engineering & Management, Mangaluru.",
    highlights: [
      "Team: Naren and team (ISE Batch 2026)",
      "Project Supervisor / Mentor: Dr. Rithesh Pakkala P",
      "Affiliation: Visvesvaraya Technological University (VTU) curriculum standards",
    ],
    links: [
      { label: "Naren's LinkedIn", href: "https://www.linkedin.com/in/narensj20/" },
      {
        label: "Dr. Rithesh Pakkala's LinkedIn",
        href: "https://www.linkedin.com/in/dr-rithesh-pakkala-permanki-guthu-537b07",
      },
      { label: "Leave a message for the team", actionId: "contact-form" },
    ],
  },
  "login-help": {
    title: "Portal Access & Sign-In Guide",
    text: "Access to AcadeX is governed through institutional authentication:",
    highlights: [
      "Students: Log in using your registered USN / college email (@sahyadri.edu.in)",
      "Faculty / Guides: Access via authorized faculty credentials with assigned department rosters",
      "New Semester Batches: Contact your batch project coordinator if your team roster is not yet synchronized",
    ],
    links: [
      { label: "Need Coordinator Access?", actionId: "contact-form" },
    ],
  },
  "tech-stack": {
    title: "System Architecture & Technologies",
    text: "AcadeX is built with a high-performance, modern full-stack web architecture:",
    highlights: [
      "Frontend: Next.js 15 (App Router), React 19, TypeScript, Vanilla & Tailwind CSS",
      "Backend: Next.js Server Actions & Node.js REST API layer",
      "Database: PostgreSQL with ACID-compliant relational schemas and audit triggers",
      "Security: Role-based session authorization, CSRF protection, and audit logs",
    ],
  },
  "contact-form": {
    title: "Leave a Query for Department Coordinators",
    text: "Have a question about project allocation, review schedules, or institutional access? Fill out the quick note below and our team will get in touch:",
    isContactPrompt: true,
  },
};

/**
 * Pure rule-based & keyword matching (Zero AI API key required, 100% deterministic & instant)
 */
export function matchQuery(query: string): AssistantResponse {
  const q = query.trim().toLowerCase();

  if (!q) {
    return {
      text: "Please type a question or pick one of the quick topics below!",
    };
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|yo)\b/i.test(q)) {
    return {
      text: "Hello! Great to meet you. How can I assist you with AcadeX today? You can select any topic below or ask about reviews, roles, or team details.",
      links: [
        { label: "What is AcadeX?", actionId: "what-is-acadex" },
        { label: "Review Rubrics", actionId: "review-phases" },
        { label: "Contact Coordinators", actionId: "contact-form" },
      ],
    };
  }

  // Contact / Query
  if (
    q.includes("contact") ||
    q.includes("email") ||
    q.includes("message") ||
    q.includes("reach") ||
    q.includes("support") ||
    q.includes("query") ||
    q.includes("help")
  ) {
    return KNOWLEDGE_BASE["contact-form"];
  }

  // Specific query about Naren / narensj
  if (
    q.includes("naren") ||
    q.includes("narensj") ||
    q.includes("naren sj") ||
    q.includes("who is naren")
  ) {
    return KNOWLEDGE_BASE["naren-info"];
  }

  // Specific query about Mentor / Dr. Rithesh Pakkala / Supervisor / HOD
  if (
    q.includes("rithesh") ||
    q.includes("pakkala") ||
    q.includes("mentor") ||
    q.includes("supervisor") ||
    q.includes("hod")
  ) {
    return KNOWLEDGE_BASE["mentor-info"];
  }

  // Who built / Team / Developers
  if (
    q.includes("who built") ||
    q.includes("team") ||
    q.includes("author") ||
    q.includes("creator") ||
    q.includes("developer")
  ) {
    return KNOWLEDGE_BASE["team-info"];
  }

  // Reviews / Phases / Rubrics
  if (
    q.includes("phase") ||
    q.includes("review") ||
    q.includes("rubric") ||
    q.includes("mark") ||
    q.includes("score") ||
    q.includes("evaluation") ||
    q.includes("synopsis") ||
    q.includes("deadline") ||
    q.includes("viva")
  ) {
    return KNOWLEDGE_BASE["review-phases"];
  }

  // Roles / Portals
  if (
    q.includes("role") ||
    q.includes("student") ||
    q.includes("guide") ||
    q.includes("faculty") ||
    q.includes("hod") ||
    q.includes("coordinator") ||
    q.includes("permission")
  ) {
    return KNOWLEDGE_BASE["roles-access"];
  }

  // Login / Access / Accounts
  if (
    q.includes("login") ||
    q.includes("sign in") ||
    q.includes("signin") ||
    q.includes("password") ||
    q.includes("credential") ||
    q.includes("account") ||
    q.includes("usn") ||
    q.includes("register")
  ) {
    return KNOWLEDGE_BASE["login-help"];
  }

  // Tech stack
  if (
    q.includes("tech") ||
    q.includes("stack") ||
    q.includes("next") ||
    q.includes("react") ||
    q.includes("database") ||
    q.includes("postgres") ||
    q.includes("architecture")
  ) {
    return KNOWLEDGE_BASE["tech-stack"];
  }

  // About AcadeX
  if (
    q.includes("what is") ||
    q.includes("about") ||
    q.includes("acadex") ||
    q.includes("overview") ||
    q.includes("purpose") ||
    q.includes("why")
  ) {
    return KNOWLEDGE_BASE["what-is-acadex"];
  }

  // Fallback for unclassified keywords
  return {
    title: "I'm still learning!",
    text: `I couldn't find an exact match for "${query}". Here are the most helpful topics you can explore or you can leave a direct query for our coordinators:`,
    links: [
      { label: "What is AcadeX?", actionId: "what-is-acadex" },
      { label: "Review Phases & Rubrics", actionId: "review-phases" },
      { label: "Contact Department Coordinator", actionId: "contact-form" },
    ],
  };
}
