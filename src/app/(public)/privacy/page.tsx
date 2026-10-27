import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, ORG_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — AcadeX",
  description:
    "Learn how AcadeX collects, uses, and protects personal information for students, faculty, and administrators.",
};

const toc = [
  { id: "who-we-are",     label: "Who we are" },
  { id: "what-we-collect", label: "Information we collect" },
  { id: "how-we-use",     label: "How we use your information" },
  { id: "legal-basis",    label: "Legal basis for processing" },
  { id: "sharing",        label: "Sharing and disclosure" },
  { id: "retention",      label: "Data retention" },
  { id: "security",       label: "Security" },
  { id: "rights",         label: "Your rights" },
  { id: "cookies-ref",    label: "Cookies" },
  { id: "changes",        label: "Changes to this policy" },
  { id: "contact",        label: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        This policy explains how {ORG_NAME} collects, uses, and protects the personal
        data of students, faculty, and administrators who use the platform. Please read
        it carefully.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="who-we-are">1. Who we are</LegalH2>
      <LegalP>
        {ORG_NAME} is a College Academic Project Management Platform operated by your
        educational institution (&quot;Institution&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). The platform
        is accessible at the domain provided by your institution and is used exclusively
        for academic project coordination activities.
      </LegalP>
      <LegalP>
        For privacy inquiries, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="what-we-collect">2. Information we collect</LegalH2>

      <LegalH3>2.1 Account data</LegalH3>
      <LegalUl items={[
        "Full name and institutional email address",
        "Role: student, faculty, or administrator",
        "Encrypted password (via Supabase Auth — we never store plaintext passwords)",
      ]} />

      <LegalH3>2.2 Academic records</LegalH3>
      <LegalUl items={[
        "Student: University Seat Number (USN) and Cumulative Grade Point Average (CGPA)",
        "Section and department assignment",
        "Team membership, team lead status, and team formation history",
      ]} />

      <LegalH3>2.3 Project data</LegalH3>
      <LegalUl items={[
        "Proposal titles, descriptions, and SDG (Sustainable Development Goal) selections",
        "Proposal review decisions and faculty notes (approvals, rejections, revision notes)",
        "Milestone definitions and completion status",
        "Uploaded artefacts: PowerPoint files (.pptx/.ppt), reports (.pdf), GitHub repository URLs",
      ]} />

      <LegalH3>2.4 System-generated data</LegalH3>
      <LegalUl items={[
        "Timestamps of logins, submissions, and approval actions",
        "Audit log entries recording significant data changes (who changed what, and when)",
        "Session tokens and browser cookies necessary for authentication",
      ]} />

      <LegalH3>2.5 Data we do NOT collect</LegalH3>
      <LegalUl items={[
        "Payment or financial information",
        "Device identifiers beyond what Supabase Auth requires for session management",
        "Location data",
        "Biometric data",
        "Social media profiles",
      ]} />

      {/* 3 */}
      <LegalH2 id="how-we-use">3. How we use your information</LegalH2>
      <LegalUl items={[
        "Authenticate and authorise your access to role-appropriate dashboards",
        "Facilitate CGPA-based team formation and eligibility checks",
        "Enable project proposal submission, review, and approval workflows",
        "Track milestone deadlines and submission windows",
        "Store uploaded artefacts for faculty review and institutional records",
        "Send in-platform notifications about proposal decisions, invitations, and milestones",
        "Maintain an audit trail for institutional compliance and accountability",
        "Improve platform reliability, security, and performance",
      ]} />

      {/* 4 */}
      <LegalH2 id="legal-basis">4. Legal basis for processing</LegalH2>
      <LegalP>
        We process your personal data under the following legal bases:
      </LegalP>
      <LegalUl items={[
        "Legitimate interests — operating the academic management platform on behalf of your institution",
        "Contractual necessity — providing services you use as part of your academic programme",
        "Legal obligation — maintaining audit records as required by institutional and regulatory policies",
        "Consent — where explicitly sought (e.g., optional profile information)",
      ]} />

      {/* 5 */}
      <LegalH2 id="sharing">5. Sharing and disclosure</LegalH2>
      <LegalP>
        We do not sell your personal data. We may share it only as follows:
      </LegalP>
      <LegalUl items={[
        "Within the platform — faculty can view details of students in their assigned sections; students can see the names/USNs of team members in their own team",
        "Supabase (our infrastructure provider) — processes data on our behalf under a Data Processing Agreement; servers are hosted in the region selected by your institution",
        "Your institution's administrators — have access to all platform data for compliance and academic governance",
        "Legal requirement — if required by law, court order, or governmental authority",
      ]} />
      <LegalCallout type="warning">
        No data is shared with third-party advertising networks, analytics aggregators, or
        any external parties beyond those listed above.
      </LegalCallout>

      {/* 6 */}
      <LegalH2 id="retention">6. Data retention</LegalH2>
      <LegalUl items={[
        "Account data: retained for the duration of your enrolment or employment, plus a 2-year post-deactivation archive period",
        "Project data (proposals, milestones, submissions): retained for a minimum of 5 academic years for institutional record-keeping",
        "Audit logs: retained for 7 years per institutional compliance requirements",
        "Session cookies: expire at browser close or after 7 days of inactivity",
      ]} />

      {/* 7 */}
      <LegalH2 id="security">7. Security</LegalH2>
      <LegalP>
        We implement the following technical and organisational measures:
      </LegalP>
      <LegalUl items={[
        "All data in transit is encrypted using TLS 1.2+",
        "Data at rest is encrypted by Supabase (AES-256)",
        "Passwords are hashed using bcrypt — plaintext passwords are never stored or logged",
        "Row-Level Security (RLS) policies in Supabase enforce that users can only access data for their role and section",
        "Multi-Factor Authentication (MFA) is available and encouraged for all accounts",
        "Service-role database keys are never exposed to client-side code",
        "Regular dependency audits and security patching",
      ]} />
      <LegalCallout type="info">
        While we take every reasonable precaution, no system is completely immune to
        security risks. If you discover a vulnerability, please report it immediately to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>.
      </LegalCallout>

      {/* 8 */}
      <LegalH2 id="rights">8. Your rights</LegalH2>
      <LegalP>
        Depending on applicable law (including the Digital Personal Data Protection Act,
        India, 2023), you may have the right to:
      </LegalP>
      <LegalUl items={[
        "Access — request a copy of personal data we hold about you",
        "Correction — request correction of inaccurate data (e.g., wrong name or USN)",
        "Erasure — request deletion of personal data, subject to retention obligations",
        "Restriction — request that we limit processing of your data in certain circumstances",
        "Portability — receive your data in a machine-readable format",
        "Object — object to processing based on legitimate interests",
        "Withdraw consent — where processing is based on consent, you may withdraw it at any time",
      ]} />
      <LegalP>
        To exercise any of these rights, contact{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>
          {CONTACT_EMAIL}
        </a>{" "}
        with your full name, institutional email, and the specific request. We will
        respond within 30 days.
      </LegalP>

      {/* 9 */}
      <LegalH2 id="cookies-ref">9. Cookies</LegalH2>
      <LegalP>
        We use cookies solely for authentication and session management. See our{" "}
        <a href="/cookies" style={{ color: "#1e3a5f" }}>Cookie Policy</a> for full
        details.
      </LegalP>

      {/* 10 */}
      <LegalH2 id="changes">10. Changes to this policy</LegalH2>
      <LegalP>
        We may update this Privacy Policy periodically. When we do, we will revise the
        &quot;Last updated&quot; date at the top. Continued use of the platform after changes
        constitutes acceptance of the revised policy.
      </LegalP>

      {/* 11 */}
      <LegalH2 id="contact">11. Contact us</LegalH2>
      <LegalP>
        For privacy-related questions, requests, or complaints:
      </LegalP>
      <div
        className="rounded-xl p-5 text-sm text-neutral-700"
        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
      >
        <p className="font-semibold text-neutral-900 mb-1">AcadeX Privacy Team</p>
        <p>
          Email:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-1 text-xs text-neutral-400">Response time: within 30 calendar days</p>
      </div>
    </LegalLayout>
  );
}
