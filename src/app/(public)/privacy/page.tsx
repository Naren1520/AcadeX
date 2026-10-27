import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, PRINCIPAL_EMAIL, ORG_NAME, COLLEGE_NAME, DEPT_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — AcadeX",
  description:
    "Learn how AcadeX collects, uses, and protects personal information for students, faculty, and administrators at Sahyadri College of Engineering & Management.",
};

const toc = [
  { id: "who-we-are", label: "Who we are" },
  { id: "what-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use your information" },
  { id: "legal-basis", label: "Legal basis for processing" },
  { id: "sharing", label: "Sharing and disclosure" },
  { id: "retention", label: "Data retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "cookies-ref", label: "Cookies" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        This Privacy Policy explains how {ORG_NAME} collects, utilizes, and protects the academic
        and personal data of students, faculty mentors, and administrators at {COLLEGE_NAME}.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="who-we-are">1. Who we are</LegalH2>
      <LegalP>
        {ORG_NAME} is the official College Academic Project Management &amp; Governance Platform engineered exclusively for {COLLEGE_NAME} (&quot;Sahyadri&quot;, &quot;the College&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), administered by the {DEPT_NAME}. The platform is deployed exclusively for our campus community to govern undergraduate project teams, SDG proposal approvals, continuous evaluation milestones, rubrics, and academic audit readiness.
      </LegalP>
      <LegalP>
        For inquiries regarding privacy, student data governance, or platform compliance, you may contact the department or college administration at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline font-medium" style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>{" "}
        or{" "}
        <a href={`mailto:${PRINCIPAL_EMAIL}`} className="hover:underline font-medium" style={{ color: "#1e3a5f" }}>
          {PRINCIPAL_EMAIL}
        </a>.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="what-we-collect">2. Information we collect</LegalH2>

      <LegalH3>2.1 Account data</LegalH3>
      <LegalUl items={[
        "Full name and official Sahyadri institutional email address (@sahyadri.edu.in)",
        "Campus role: student, faculty guide, review committee member, or department administrator",
        "Encrypted password (via Supabase Auth — plaintext passwords are never stored or logged)",
      ]} />

      <LegalH3>2.2 Academic records</LegalH3>
      <LegalUl items={[
        "Student: University Seat Number (USN) and Cumulative Grade Point Average (CGPA)",
        "Section, semester, and engineering branch within Sahyadri College of Engineering & Management",
        "Team membership, team lead designation, and student project formation history",
      ]} />

      <LegalH3>2.3 Project data</LegalH3>
      <LegalUl items={[
        "Proposal titles, problem statements, and SDG (Sustainable Development Goal) selections",
        "Proposal review committee decisions and faculty remarks (approvals, rejections, revision notes)",
        "Milestone definitions, evaluation criteria, and completion status",
        "Uploaded artefacts: presentation slides (.pptx/.ppt), project reports (.pdf), GitHub repository links",
      ]} />

      <LegalH3>2.4 System-generated data</LegalH3>
      <LegalUl items={[
        "Timestamps of logins, submissions, guide approvals, and committee evaluations",
        "Tamper-resistant audit log entries recording critical workflow actions",
        "Secure session tokens and authentication cookies necessary for portal access",
      ]} />

      <LegalH3>2.5 Data we do NOT collect</LegalH3>
      <LegalUl items={[
        "Payment or commercial financial information",
        "Device telemetry beyond standard secure authentication session requirements",
        "Real-time GPS or location tracking",
        "Biometric data",
        "Third-party advertising trackers or social media pixels",
      ]} />

      {/* 3 */}
      <LegalH2 id="how-we-use">3. How we use your information</LegalH2>
      <LegalUl items={[
        "Authenticate and authorize access to role-based student and faculty workspaces",
        "Enforce CGPA-balanced team formation rules and eligibility thresholds",
        "Facilitate project proposal submissions, review committee workflows, and approval stages",
        "Track CIE milestone deadlines and submission evaluation windows",
        "Store uploaded project deliverables for faculty mentor review and departmental archives",
        "Deliver in-portal notifications regarding proposal decisions, team invitations, and deadlines",
        "Maintain an immutable audit trail for internal academic audits and NBA/NAAC accreditation compliance",
        "Ensure system security, integrity, and operational reliability for the College",
      ]} />

      {/* 4 */}
      <LegalH2 id="legal-basis">4. Legal basis for processing</LegalH2>
      <LegalP>
        We process student and faculty academic records under the following legal grounds:
      </LegalP>
      <LegalUl items={[
        "Academic programme governance — fulfilling curriculum requirements and continuous evaluation at Sahyadri College of Engineering & Management",
        "Institutional necessity — facilitating team formations, faculty guide assignments, and milestone grading",
        "Accreditation and statutory compliance — maintaining audit-ready project records per autonomous college academic regulations",
        "Campus authentication — ensuring only verified college students and faculty access internal systems",
      ]} />

      {/* 5 */}
      <LegalH2 id="sharing">5. Sharing and disclosure</LegalH2>
      <LegalP>
        We do not sell, rent, or commercialize your personal or academic data. Access is strictly scoped to the Sahyadri academic hierarchy:
      </LegalP>
      <LegalUl items={[
        "Within the College: Appointed faculty guides and evaluation panel committees can review students and teams in their assigned sections; registered team members can collaborate on team proposals and milestones",
        "Department Leadership: The Head of Department (HoD) and academic coordinators have administrative oversight for departmental governance and curriculum delivery",
        "Infrastructure Provider: Supabase processes data on secure cloud instances under a Data Processing Agreement with Row-Level Security (RLS) and end-to-end TLS encryption",
        "Statutory Authorities: Only where mandated by college disciplinary regulations, autonomous academic statutes, or applicable Indian law",
      ]} />
      <LegalCallout type="warning">
        No student or faculty data is shared with third-party advertising networks, analytics brokers,
        or external commercial entities.
      </LegalCallout>

      {/* 6 */}
      <LegalH2 id="retention">6. Data retention</LegalH2>
      <LegalUl items={[
        "Account records: Retained for the duration of the student's degree program at Sahyadri College, plus standard academic archiving",
        "Project records (proposals, synopses, milestone PPTs, reports, rubrics): Retained for a minimum of 5 academic years for autonomous college record-keeping and NBA/NAAC audit verification",
        "Audit logs: Retained for 7 academic years per college compliance policies",
        "Session cookies: Expire upon browser close or after 7 days of inactivity",
      ]} />

      {/* 7 */}
      <LegalH2 id="security">7. Security</LegalH2>
      <LegalP>
        We implement institutional-grade technical and organizational safeguards:
      </LegalP>
      <LegalUl items={[
        "All data in transit is encrypted using modern TLS 1.2+ protocols",
        "Data at rest is secured via AES-256 cloud encryption",
        "Passwords are cryptographically hashed using bcrypt — plaintext credentials are never stored or logged",
        "Database Row-Level Security (RLS) strictly isolates student, faculty, and administrative access privileges",
        "Multi-Factor Authentication (MFA) is supported and encouraged for all college accounts",
        "Administrative database credentials are never exposed to client browsers",
        "Regular dependency audits and continuous vulnerability management",
      ]} />
      <LegalCallout type="info">
        If you discover an unexpected software vulnerability, please report it immediately to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline" style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>.
      </LegalCallout>

      {/* 8 */}
      <LegalH2 id="rights">8. Your rights</LegalH2>
      <LegalP>
        Under the Digital Personal Data Protection Act (DPDPA), India, 2023 and Sahyadri autonomous academic regulations, enrolled students and faculty members have the right to:
      </LegalP>
      <LegalUl items={[
        "Access — Request a summary of personal and academic project records stored on AcadeX",
        "Correction — Request rectification of inaccurate academic data (e.g., misspelled name, incorrect USN, or branch)",
        "Grievance Redressal — Raise data or evaluation concerns through the department project coordinator or HoD",
        "Confidentiality — Ensure team project ideas and SDG proposals remain protected within authorized review committee access",
      ]} />
      <LegalP>
        To submit a request, contact the Department Office at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline font-medium" style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>{" "}
        with your full name, USN, and department section.
      </LegalP>

      {/* 9 */}
      <LegalH2 id="cookies-ref">9. Cookies</LegalH2>
      <LegalP>
        We use essential cookies solely for authentication and session management. See our{" "}
        <a href="/cookies" className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>Cookie Policy</a> for full
        details.
      </LegalP>

      {/* 10 */}
      <LegalH2 id="changes">10. Changes to this policy</LegalH2>
      <LegalP>
        We may update this Privacy Policy periodically to reflect enhancements in college regulations. When changes are published, we will revise the
        &quot;Last updated&quot; date at the top. Continued use of the platform constitutes adherence to the revised policy.
      </LegalP>

      {/* 11 */}
      <LegalH2 id="contact">11. Contact us</LegalH2>
      <LegalP>
        For all academic project governance and privacy inquiries:
      </LegalP>
      <div
        className="rounded-xl p-5 text-sm text-neutral-700 space-y-1.5"
        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
      >
        <p className="font-bold text-neutral-900">{DEPT_NAME}</p>
        <p className="text-xs text-neutral-600">{COLLEGE_NAME}</p>
        <p className="text-xs text-neutral-500">Sahyadri Campus, Adyar, Mangaluru, Karnataka, India - 575007</p>
        <div className="pt-2 text-xs border-t border-neutral-200/80 space-y-1">
          <p>
            General Inquiries:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Principal Office:{" "}
            <a href={`mailto:${PRINCIPAL_EMAIL}`} className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>
              {PRINCIPAL_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}

