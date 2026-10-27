import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, ORG_NAME, ORG_FULL,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — AcadeX",
  description:
    "Standards of conduct and acceptable use requirements for students, faculty, and administrators using AcadeX.",
};

const toc = [
  { id: "purpose-scope",     label: "Purpose and scope" },
  { id: "academic-integrity", label: "Academic integrity" },
  { id: "account-security",  label: "Account credentials and security" },
  { id: "system-security",   label: "System and platform security" },
  { id: "content-standards", label: "Content and collaboration" },
  { id: "resource-quotas",   label: "Resource usage and file uploads" },
  { id: "enforcement",       label: "Violations and enforcement" },
  { id: "reporting",         label: "Reporting and contact" },
];

export default function AcceptableUsePage() {
  return (
    <LegalLayout title="Acceptable Use Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        This Acceptable Use Policy (&quot;AUP&quot;) defines the rules and standards of
        conduct required of all users — including students, faculty advisors, department
        coordinators, and administrators — accessing {ORG_FULL}.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="purpose-scope">1. Purpose and Scope</LegalH2>
      <LegalP>
        {ORG_NAME} is an academic platform provided to streamline project allocation,
        mentorship, milestone tracking, and grading for higher education institutions.
        To maintain a fair, secure, and constructive learning environment, all users must
        comply with this policy whenever interacting with {ORG_NAME}.
      </LegalP>
      <LegalP>
        This policy supplements institutional academic honor codes and disciplinary
        guidelines. In the event of a conflict between this policy and your
        institution&apos;s regulations, institutional guidelines take precedence.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="academic-integrity">2. Academic Integrity</LegalH2>
      <LegalP>
        Academic honesty is central to the mission of {ORG_NAME}. All users must adhere
        to rigorous ethical standards:
      </LegalP>
      <LegalUl
        items={[
          "Authenticity: All project proposals, code repositories, documentation, and milestone deliverables submitted through AcadeX must be the authentic work of the registered team members.",
          "Attribution: Any external libraries, open-source code, third-party frameworks, research papers, or AI-assisted tools utilized must be explicitly cited and acknowledged in compliance with institutional guidelines.",
          "No Plagiarism or Ghostwriting: Purchasing project code, contracting third-party developers, or presenting another student's work as your own is strictly prohibited.",
          "Accurate Reporting: Falsifying project metrics, test results, survey data, or faculty meeting records is an academic integrity violation.",
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
          "Always sign out after accessing AcadeX from shared workstations, lab computers, or library terminals.",
          "Notify your institutional administrator or contact us immediately if you suspect unauthorized access to your account.",
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
          "Probing or Scanning: Do not conduct vulnerability assessments, port scanning, penetration testing, or stress tests against AcadeX infrastructure without prior written authorization from the administration.",
          "Bypassing Controls: Do not attempt to evade authentication checks, role-based access restrictions, or Row-Level Security (RLS) policies.",
          "Automated Scraping: Do not use automated scrapers, bots, crawlers, or unauthorized scripts to extract platform data or student/faculty records.",
          "Denial of Service: Do not flood, spam, or overload our servers, APIs, or database connections.",
          "Reverse Engineering: Do not decompile, disassemble, or reverse engineer any proprietary component or backend logic of the platform.",
        ]}
      />

      {/* 5 */}
      <LegalH2 id="content-standards">5. Content and Collaboration Standards</LegalH2>
      <LegalP>
        {ORG_NAME} provides communication tools, feedback remarks, project descriptions,
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
        To ensure fair resource distribution for all departments and batches:
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
        {ORG_NAME} administrators and institutional department heads monitor adherence
        to this policy. In case of suspected violations, the following actions may be
        taken:
      </LegalP>
      <LegalUl
        items={[
          "Temporary suspension or restriction of platform access during ongoing investigations.",
          "Rejection or nullification of affected milestone submissions or proposal approvals.",
          "Formal escalation to the department academic disciplinary committee or institutional dean.",
          "Permanent account termination and referral to law enforcement where required by applicable legal statutes.",
        ]}
      />

      {/* 8 */}
      <LegalH2 id="reporting">8. Reporting and Contact</LegalH2>
      <LegalP>
        If you discover an academic violation, vulnerability, or violation of this
        policy, please report it promptly to:
      </LegalP>
      <div
        className="rounded-xl p-5 text-sm text-neutral-700 mt-3"
        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
      >
        <p className="font-semibold text-neutral-900 mb-1">AcadeX Compliance &amp; Honor Code</p>
        <p>
          Email:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Inquiries are handled confidentially and reviewed by our compliance team.
        </p>
      </div>
    </LegalLayout>
  );
}
