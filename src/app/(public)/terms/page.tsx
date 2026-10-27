import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, PRINCIPAL_EMAIL, ORG_NAME, ORG_FULL, COLLEGE_NAME, DEPT_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — AcadeX",
  description:
    "Terms and conditions governing student and faculty access to the AcadeX academic governance platform at Sahyadri College of Engineering & Management.",
};

const toc = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Your account" },
  { id: "permitted-use", label: "Permitted use" },
  { id: "prohibited", label: "Prohibited conduct" },
  { id: "content", label: "User-generated content" },
  { id: "ip", label: "Intellectual property" },
  { id: "availability", label: "Service availability" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="warning">
        By accessing or logging into {ORG_NAME}, you agree to adhere to these Terms of
        Service and the academic governance regulations of {COLLEGE_NAME}. If you do not agree, please discontinue use immediately.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="acceptance">1. Acceptance of terms</LegalH2>
      <LegalP>
        These Terms of Service (&quot;Terms&quot;) constitute a binding academic agreement between
        you (&quot;User&quot;) and {COLLEGE_NAME} (&quot;Sahyadri&quot;, &quot;the College&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your access to and use of the {ORG_NAME} academic project governance system. By
        logging in with your college credentials or submitting project coursework, you confirm
        that you have read, understood, and agreed to these Terms and our{" "}
        <a href="/privacy" className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>Privacy Policy</a>.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="eligibility">2. Eligibility</LegalH2>
      <LegalUl items={[
        "You must be an active enrolled student, appointed faculty mentor/guide, or authorized academic coordinator at Sahyadri College of Engineering & Management",
        "User accounts are provisioned directly by the Department of Information Science & Engineering administrators — unauthorized self-registration is strictly disabled",
        "Access is granted exclusively for academic coursework, project milestone tracking, rubrics evaluation, and degree curriculum compliance at Sahyadri",
        "Students must belong to authorized engineering semesters and sections configured by the department",
      ]} />

      {/* 3 */}
      <LegalH2 id="account">3. Your account</LegalH2>
      <LegalH3>3.1 Credentials</LegalH3>
      <LegalP>
        You are responsible for maintaining the confidentiality of your college credentials.
        Do not share your password or authentication links with peers. If you suspect your account has been
        compromised, notify the department administration immediately at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium hover:underline" style={{ color: "#1e3a5f" }}>{CONTACT_EMAIL}</a>.
      </LegalP>
      <LegalH3>3.2 Accuracy</LegalH3>
      <LegalP>
        You agree to maintain truthful and accurate records on the platform,
        including registered USN, team roster data, proposal synopses, and milestone documentation. Providing falsified
        or misleading academic data constitutes academic misconduct.
      </LegalP>
      <LegalH3>3.3 Account security</LegalH3>
      <LegalP>
        We strongly recommend enabling Multi-Factor Authentication (MFA) on your account. You
        remain accountable for all submissions and evaluation inputs recorded under your session.
      </LegalP>

      {/* 4 */}
      <LegalH2 id="permitted-use">4. Permitted use</LegalH2>
      <LegalP>You may use {ORG_NAME} to:</LegalP>
      <LegalUl items={[
        "Form and manage student project teams in compliance with CGPA diversity and department guidelines",
        "Submit, refine, and track project proposals mapped to United Nations SDGs",
        "View milestone deadlines, rubrics criteria, and committee evaluation schedules set by department faculty",
        "Upload authentic project deliverables (synopsis, design PPTs, IEEE reports, GitHub repository links) within active submission windows",
        "Receive timely in-platform review notices, approval stages, and panel feedback",
        "Review your individual continuous evaluation scores and team progress history",
      ]} />

      {/* 5 */}
      <LegalH2 id="prohibited">5. Prohibited conduct</LegalH2>
      <LegalP>Users must strictly refrain from:</LegalP>
      <LegalUl items={[
        "Impersonating another student, faculty mentor, review panelist, or college administrator",
        "Attempting to access sections, student evaluations, or administrative consoles beyond your assigned role",
        "Uploading malicious payloads, virus-infected archives, or unauthorized scripts",
        "Submitting plagiarized, ghostwritten, commercially purchased, or academically dishonest project code or reports",
        "Attempting to circumvent CGPA team-formation rules, submission deadlines, or committee evaluation locks",
        "Interfering with server performance, executing automated scraping, or conducting unauthorized vulnerability scans",
        "Sharing login credentials with project teammates or third parties",
        "Engaging in any conduct violating Sahyadri College student honor codes or autonomous academic regulations",
      ]} />
      <LegalCallout type="warning">
        Violations of these prohibitions may result in immediate account suspension,
        nullification of project submissions, and formal referral to the Sahyadri College Academic Integrity and Disciplinary Committee.
      </LegalCallout>

      {/* 6 */}
      <LegalH2 id="content">6. User-generated content</LegalH2>
      <LegalP>
        By uploading proposals, code repositories, reports, presentations, or milestone deliverables to
        {" "}{ORG_NAME}, you grant the College an academic, royalty-free license to
        store, review, display, and archive that material solely for the purpose of academic mentorship,
        grading, rubrics evaluation, and departmental accreditation verification at Sahyadri College of Engineering &amp; Management.
      </LegalP>
      <LegalP>
        Student teams retain all primary intellectual ownership of their original project work and software. You confirm
        that you hold all rights to your submissions and that your deliverables do not infringe upon any third-party intellectual property or copyright.
      </LegalP>

      {/* 7 */}
      <LegalH2 id="ip">7. Intellectual property</LegalH2>
      <LegalP>
        The {ORG_NAME} software architecture, user interface, database schemas, and documentation are proprietary
        academic systems developed for {COLLEGE_NAME}. Nothing in these Terms grants users rights in the underlying platform software beyond authorized academic use.
      </LegalP>

      {/* 8 */}
      <LegalH2 id="availability">8. Service availability</LegalH2>
      <LegalP>
        We aim to maintain high availability throughout the academic semester. The platform may undergo brief maintenance for:
      </LegalP>
      <LegalUl items={[
        "Scheduled system updates (announced in advance via departmental notices)",
        "Emergency security and framework patches",
        "Cloud infrastructure maintenance by our hosting providers",
      ]} />
      <LegalP>
        In the event of an unexpected platform outage during critical deadline windows, milestone submission timelines
        may be officially extended by the Department Project Committee.
      </LegalP>

      {/* 9 */}
      <LegalH2 id="liability">9. Limitation of liability</LegalH2>
      <LegalP>
        To the extent permitted under applicable law, {ORG_NAME} and college operators
        shall not be liable for:
      </LegalP>
      <LegalUl items={[
        "Loss of local files due to student failure to maintain local backups or GitHub commits",
        "Academic consequences resulting from delayed submissions or unsubmitted milestone deliverables",
        "Downtime caused by campus internet connectivity issues or third-party cloud outages",
      ]} />

      {/* 10 */}
      <LegalH2 id="termination">10. Termination</LegalH2>
      <LegalP>
        Access to {ORG_NAME} may be suspended or revoked if:
      </LegalP>
      <LegalUl items={[
        "You violate these Terms or the Acceptable Use Policy",
        "Your active enrollment or faculty appointment at Sahyadri College concludes",
        "A student graduates or transitions to alumni status",
        "Suspicious, fraudulent, or malicious activity is detected on your credentials",
      ]} />
      <LegalP>
        Upon graduation or departure, active submission privileges cease, while academic project records remain preserved per college archiving guidelines.
      </LegalP>

      {/* 11 */}
      <LegalH2 id="governing-law">11. Governing law</LegalH2>
      <LegalP>
        These Terms are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, claim, or controversy arising out of or in connection with these Terms or the platform shall be subject to the exclusive jurisdiction of the competent courts in Mangaluru, Karnataka, India.
      </LegalP>

      {/* 12 */}
      <LegalH2 id="changes">12. Changes to these terms</LegalH2>
      <LegalP>
        The College may update these Terms periodically to incorporate revised academic regulations. The &quot;Last updated&quot; date will reflect any revisions. Continued use of {ORG_NAME} constitutes acceptance of the current policy.
      </LegalP>

      {/* 13 */}
      <LegalH2 id="contact">13. Contact</LegalH2>
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
