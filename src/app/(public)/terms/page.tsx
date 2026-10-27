import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, ORG_NAME, ORG_FULL,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — AcadeX",
  description:
    "The terms and conditions governing access to and use of the AcadeX platform.",
};

const toc = [
  { id: "acceptance",     label: "Acceptance of terms" },
  { id: "eligibility",    label: "Eligibility" },
  { id: "account",        label: "Your account" },
  { id: "permitted-use",  label: "Permitted use" },
  { id: "prohibited",     label: "Prohibited conduct" },
  { id: "content",        label: "User-generated content" },
  { id: "ip",             label: "Intellectual property" },
  { id: "availability",   label: "Service availability" },
  { id: "liability",      label: "Limitation of liability" },
  { id: "termination",    label: "Termination" },
  { id: "governing-law",  label: "Governing law" },
  { id: "changes",        label: "Changes to these terms" },
  { id: "contact",        label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="warning">
        By accessing or using {ORG_NAME}, you agree to be bound by these Terms of
        Service. If you do not agree, please discontinue use immediately.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="acceptance">1. Acceptance of terms</LegalH2>
      <LegalP>
        These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between
        you (&quot;User&quot;) and {ORG_FULL} (&quot;{ORG_NAME}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By
        creating an account, logging in, or otherwise using the platform, you confirm
        that you have read, understood, and agree to these Terms and our{" "}
        <a href="/privacy" style={{ color: "#1e3a5f" }}>Privacy Policy</a>.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="eligibility">2. Eligibility</LegalH2>
      <LegalUl items={[
        "You must be a currently enrolled student, appointed faculty member, or designated administrator at the participating institution",
        "Accounts are created exclusively by institutional administrators — you may not self-register",
        "You must be at least 13 years of age to use this platform",
        "Access to the platform is limited to academic purposes within the scope defined by your institution",
      ]} />

      {/* 3 */}
      <LegalH2 id="account">3. Your account</LegalH2>
      <LegalH3>3.1 Credentials</LegalH3>
      <LegalP>
        You are responsible for maintaining the confidentiality of your login credentials.
        Do not share your password with anyone. If you suspect your account has been
        compromised, notify us immediately at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#1e3a5f" }}>{CONTACT_EMAIL}</a>.
      </LegalP>
      <LegalH3>3.2 Accuracy</LegalH3>
      <LegalP>
        You agree to provide accurate and complete information when using the platform,
        including correct team names, proposal details, and file uploads. Providing false
        or misleading information may result in account suspension.
      </LegalP>
      <LegalH3>3.3 Account security</LegalH3>
      <LegalP>
        We recommend enabling Multi-Factor Authentication (MFA) for your account. You
        are solely responsible for all activity that occurs under your credentials.
      </LegalP>

      {/* 4 */}
      <LegalH2 id="permitted-use">4. Permitted use</LegalH2>
      <LegalP>You may use {ORG_NAME} to:</LegalP>
      <LegalUl items={[
        "Form and manage academic project teams within your assigned section",
        "Submit, revise, and track project proposals",
        "View milestones and submission deadlines set by your faculty supervisor",
        "Upload project artefacts (presentations, reports, GitHub links) within open submission windows",
        "Communicate via in-platform notifications",
        "Review your academic profile and notification history",
      ]} />

      {/* 5 */}
      <LegalH2 id="prohibited">5. Prohibited conduct</LegalH2>
      <LegalP>You must not:</LegalP>
      <LegalUl items={[
        "Impersonate another student, faculty member, or administrator",
        "Attempt to access accounts, data, or system resources beyond your authorised role",
        "Upload malicious files, scripts, or executables through submission forms",
        "Submit plagiarised, fabricated, or otherwise academically dishonest content",
        "Attempt to bypass CGPA-based team eligibility rules",
        "Interfere with the availability or integrity of the platform (e.g., DoS attacks, automated scraping)",
        "Share your account credentials with others or allow another person to use your account",
        "Engage in any unlawful activity through or in connection with the platform",
      ]} />
      <LegalCallout type="warning">
        Violations of these prohibitions may result in immediate account suspension,
        referral to your institution&apos;s academic integrity committee, and/or legal action.
      </LegalCallout>

      {/* 6 */}
      <LegalH2 id="content">6. User-generated content</LegalH2>
      <LegalP>
        By uploading proposals, reports, presentations, or any other content to
        {" "}{ORG_NAME}, you grant the platform a non-exclusive, royalty-free licence to
        store, display, and process that content solely for the purpose of providing the
        academic management service to your institution.
      </LegalP>
      <LegalP>
        You retain all ownership rights to your original work. You represent and warrant
        that you have the right to submit any content you upload, and that it does not
        infringe any third-party intellectual property rights.
      </LegalP>

      {/* 7 */}
      <LegalH2 id="ip">7. Intellectual property</LegalH2>
      <LegalP>
        The {ORG_NAME} platform, including its software, design, trademarks, and
        documentation, is owned by or licensed to the platform operators. Nothing in
        these Terms grants you any rights in the platform itself beyond the limited
        right to use it for authorised academic purposes.
      </LegalP>

      {/* 8 */}
      <LegalH2 id="availability">8. Service availability</LegalH2>
      <LegalP>
        We strive to maintain high availability but do not guarantee uninterrupted
        access. The platform may be temporarily unavailable for:
      </LegalP>
      <LegalUl items={[
        "Scheduled maintenance (communicated in advance where possible)",
        "Emergency security patches",
        "Infrastructure incidents beyond our reasonable control",
      ]} />
      <LegalP>
        Submission windows and milestone deadlines may be extended by faculty in the
        event of documented platform outages. Contact your supervisor if a technical
        issue prevents a timely submission.
      </LegalP>

      {/* 9 */}
      <LegalH2 id="liability">9. Limitation of liability</LegalH2>
      <LegalP>
        To the fullest extent permitted by applicable law, {ORG_NAME} and its operators
        shall not be liable for:
      </LegalP>
      <LegalUl items={[
        "Loss of data caused by user error (e.g., uploading incorrect files)",
        "Academic consequences arising from missed deadlines due to user inaction",
        "Indirect, incidental, or consequential damages arising from use of the platform",
        "Third-party service outages (including Supabase or hosting providers) beyond our control",
      ]} />

      {/* 10 */}
      <LegalH2 id="termination">10. Termination</LegalH2>
      <LegalP>
        We reserve the right to suspend or terminate your access to {ORG_NAME} at any
        time, with or without notice, if:
      </LegalP>
      <LegalUl items={[
        "You violate these Terms or our Acceptable Use Policy",
        "Your enrolment or employment at the institution ends",
        "The institution discontinues use of the platform",
        "We detect suspected fraudulent or malicious activity on your account",
      ]} />
      <LegalP>
        Upon termination, your right to access the platform ceases immediately. Data
        retention rules described in the Privacy Policy continue to apply.
      </LegalP>

      {/* 11 */}
      <LegalH2 id="governing-law">11. Governing law</LegalH2>
      <LegalP>
        These Terms are governed by the laws of India. Any disputes arising from or
        relating to these Terms or your use of {ORG_NAME} shall be subject to the
        exclusive jurisdiction of the courts located in the state in which the
        Institution is registered.
      </LegalP>

      {/* 12 */}
      <LegalH2 id="changes">12. Changes to these terms</LegalH2>
      <LegalP>
        We may update these Terms periodically. When changes are made, we will update
        the &quot;Last updated&quot; date. Your continued use of {ORG_NAME} after any changes
        constitutes acceptance of the revised Terms.
      </LegalP>

      {/* 13 */}
      <LegalH2 id="contact">13. Contact</LegalH2>
      <div
        className="rounded-xl p-5 text-sm text-neutral-700"
        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
      >
        <p className="font-semibold text-neutral-900 mb-1">AcadeX Legal Team</p>
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
