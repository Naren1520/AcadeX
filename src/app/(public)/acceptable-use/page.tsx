import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, PRINCIPAL_EMAIL, ORG_NAME, ORG_FULL, COLLEGE_NAME, DEPT_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — AcadeX",
  description:
    "Standards of conduct and acceptable academic use requirements for students and faculty at Sahyadri College of Engineering & Management.",
};

const toc = [
  { id: "purpose-scope", label: "Purpose and scope" },
  { id: "academic-integrity", label: "Academic integrity" },
  { id: "account-security", label: "Account credentials and security" },
  { id: "system-security", label: "System and platform security" },
  { id: "content-standards", label: "Content and collaboration" },
  { id: "resource-quotas", label: "Resource usage and file uploads" },
  { id: "enforcement", label: "Violations and enforcement" },
  { id: "reporting", label: "Reporting and contact" },
];

export default function AcceptableUsePage() {
  return (
    <LegalLayout title="Acceptable Use Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        This Acceptable Use Policy (&quot;AUP&quot;) defines the standards of
        conduct and academic ethics required of all users — including students, faculty mentors,
        review committee evaluators, and administrators — accessing {ORG_FULL}.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="purpose-scope">1. Purpose and Scope</LegalH2>
      <LegalP>
        {ORG_NAME} is the dedicated academic governance platform engineered for {COLLEGE_NAME} to streamline project allocation,
        faculty guide mentorship, continuous milestone tracking, and grading across engineering departments.
        To maintain an authentic, ethical, and constructive academic environment, all registered students and faculty must
        comply with this policy whenever interacting with the system.
      </LegalP>
      <LegalP>
        This policy operates in full alignment with the official Sahyadri College Academic Honor Code, Student Disciplinary Regulations,
        and autonomous curriculum guidelines. In all academic evaluations, autonomous college regulations take precedence.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="academic-integrity">2. Academic Integrity</LegalH2>
      <LegalP>
        Academic honesty and originality are paramount. All users must adhere
        to rigorous ethical standards:
      </LegalP>
      <LegalUl
        items={[
          "Authenticity: All project proposals, software repositories, circuit schematics, reports, and milestone deliverables submitted through AcadeX must be the original, authentic work of the registered team members.",
          "Attribution: Any external libraries, open-source code, third-party frameworks, research papers, or AI-assisted tools utilized must be explicitly cited in IEEE/departmental format in compliance with Sahyadri College academic guidelines.",
          "No Plagiarism or Ghostwriting: Purchasing project code, commissioning third-party agencies, or submitting another team's work as your own is strictly prohibited and constitutes gross academic misconduct.",
          "Accurate Reporting: Fabricating project metrics, test results, hardware execution logs, or faculty guide meeting records is an academic integrity violation.",
        ]}
      />

      {/* 3 */}
      <LegalH2 id="account-security">3. Account Credentials and Security</LegalH2>
      <LegalP>
        Access to {ORG_NAME} is tied to individual institutional accounts. You are
        responsible for safeguarding your access:
      </LegalP>
      <LegalUl
        items={[
          "Do not share passwords, magic links, or multi-factor authentication codes with anyone, including project teammates or student peers.",
          "Do not attempt to log in using another user's credentials, regardless of whether permission was granted.",
          "Always sign out after accessing AcadeX from shared campus computers, departmental lab terminals, or library systems.",
          "Notify the Department of Information Science & Engineering administration immediately if you suspect unauthorized access to your account.",
        ]}
      />

      {/* 4 */}
      <LegalH2 id="system-security">4. System and Platform Security</LegalH2>
      <LegalP>
        You must not engage in any activity that compromises the security, stability, or
        availability of {ORG_NAME}:
      </LegalP>
      <LegalUl
        items={[
          "Probing or Scanning: Do not conduct vulnerability assessments, port scanning, penetration testing, or stress tests against AcadeX infrastructure without prior written authorization from the college administration.",
          "Bypassing Controls: Do not attempt to evade authentication checks, role-based access restrictions, or Row-Level Security (RLS) policies.",
          "Automated Scraping: Do not use automated scrapers, bots, crawlers, or unauthorized scripts to extract platform data or student/faculty records.",
          "Denial of Service: Do not flood, spam, or overload our servers, APIs, or database connections.",
          "Reverse Engineering: Do not decompile, disassemble, or reverse engineer any proprietary component or backend logic of the platform.",
        ]}
      />

      {/* 5 */}
      <LegalH2 id="content-standards">5. Content and Collaboration Standards</LegalH2>
      <LegalP>
        {ORG_NAME} provides communication tools, review remarks, project synopses,
        and team workspaces. All content submitted must remain professional and respectful:
      </LegalP>
      <LegalUl
        items={[
          "Professionalism: Team names, project abstracts, synopsis remarks, and review comments must adhere to academic standards and remain respectful.",
          "Prohibited Content: Do not upload or share content that is defamatory, abusive, harassing, discriminatory, sexually explicit, or infringing on any patent, copyright, or trademark.",
          "Privacy of Peers: Do not publish or distribute personal contact information, academic grades, or confidential remarks of other students or faculty without explicit consent.",
        ]}
      />

      {/* 6 */}
      <LegalH2 id="resource-quotas">6. Resource Usage and File Uploads</LegalH2>
      <LegalP>
        To ensure fair resource distribution for all engineering batches:
      </LegalP>
      <LegalUl
        items={[
          "Allowed File Formats: Uploads must adhere to designated file types (such as PDF, DOCX, ZIP, PPTX) and size limits specified for each submission window.",
          "No Malicious Payloads: Files must not contain viruses, trojans, worms, keyloggers, macros, or any executable binaries designed to execute unauthorized code.",
          "Storage Stewardship: Do not use project file storage to host personal media, pirated material, games, or files unrelated to academic curriculum requirements.",
        ]}
      />

      {/* 7 */}
      <LegalH2 id="enforcement">7. Violations and Enforcement</LegalH2>
      <LegalP>
        {ORG_NAME} administrators and departmental review committees monitor adherence
        to this policy. In case of suspected violations, the following actions may be
        taken:
      </LegalP>
      <LegalUl
        items={[
          "Temporary suspension or restriction of platform access during ongoing investigations.",
          "Rejection or nullification of affected milestone submissions or proposal approvals.",
          "Formal escalation to the Head of Department (HoD) and the Sahyadri College Academic Disciplinary Committee.",
          "Permanent account termination and referral for institutional disciplinary review under college autonomous regulations.",
        ]}
      />

      {/* 8 */}
      <LegalH2 id="reporting">8. Reporting and Contact</LegalH2>
      <LegalP>
        If you discover an academic violation, vulnerability, or violation of this
        policy, please report it promptly to:
      </LegalP>
      <div
        className="rounded-xl p-5 text-sm text-neutral-700 mt-3 space-y-1.5"
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

