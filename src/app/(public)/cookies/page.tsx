import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, CONTACT_EMAIL, PRINCIPAL_EMAIL, ORG_NAME, COLLEGE_NAME, DEPT_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy — AcadeX",
  description:
    "Information about how AcadeX uses essential authentication cookies for student and faculty portals at Sahyadri College of Engineering & Management.",
};

const toc = [
  { id: "what-are-cookies", label: "What are cookies?" },
  { id: "cookies-we-use", label: "Cookies we use" },
  { id: "no-tracking", label: "No third-party tracking" },
  { id: "managing", label: "Managing cookies" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        {ORG_NAME} at {COLLEGE_NAME} uses only strictly necessary authentication cookies to maintain
        secure login sessions for students and faculty. We do not use commercial advertising or third-party tracking cookies.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="what-are-cookies">1. What are cookies?</LegalH2>
      <LegalP>
        Cookies are small, secure cryptographic text files placed on your device by a web portal. They are widely
        used to maintain authenticated sessions and protect accounts against unauthorized access. Cookies set directly
        by AcadeX are called first-party cookies.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="cookies-we-use">2. Cookies we use</LegalH2>
      <LegalP>
        {ORG_NAME} uses solely <strong>strictly necessary (essential) cookies</strong>.
        These are essential for student, faculty guide, and administrative authentication.
      </LegalP>

      <LegalH3>2.1 Authentication cookies (Supabase Auth)</LegalH3>
      <div className="rounded overflow-x-auto mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <table className="text-xs w-full">
          <thead style={{ backgroundColor: "#f9fafb" }}>
            <tr>
              {["Cookie name", "Purpose", "Duration", "Type"].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-semibold text-neutral-600 uppercase tracking-wide border-b whitespace-nowrap" style={{ borderColor: "#e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["sb-access-token", "Authenticates your current session (JWT)", "Session / 1 hour", "HTTP-only, Secure"],
              ["sb-refresh-token", "Renews your session without re-login", "7 days", "HTTP-only, Secure"],
              ["sb-auth-token", "Backup token for Supabase SDK authentication", "Session", "HTTP-only, Secure"],
            ].map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-neutral-600 border-b font-mono" style={{ borderColor: "#e5e7eb" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LegalCallout type="info">
        All authentication cookies are <strong>HTTP-only</strong> and <strong>Secure</strong> — they
        cannot be read by JavaScript and are transmitted strictly over encrypted HTTPS connections. This protects
        against cross-site scripting (XSS) session hijacking.
      </LegalCallout>

      <LegalH3>2.2 Next.js framework cookies</LegalH3>
      <div className="rounded overflow-x-auto mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <table className="text-xs w-full">
          <thead style={{ backgroundColor: "#f9fafb" }}>
            <tr>
              {["Cookie name", "Purpose", "Duration"].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-semibold text-neutral-600 uppercase tracking-wide border-b whitespace-nowrap" style={{ borderColor: "#e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["__nextjs_*", "Next.js framework internals (client-side routing and hydration)", "Session"],
            ].map((row, i) => (
              <tr key={i} style={{ backgroundColor: "#ffffff" }}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-neutral-600 border-b font-mono" style={{ borderColor: "#e5e7eb" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3 */}
      <LegalH2 id="no-tracking">3. No third-party tracking</LegalH2>
      <LegalP>
        {ORG_NAME} operates strictly as an educational platform and does <strong>not</strong> deploy:
      </LegalP>
      <LegalUl items={[
        "Commercial advertising networks or retargeting pixels",
        "Google Analytics, Facebook Pixel, or external data brokers",
        "Behavioral trackers or session recording scripts (e.g., Hotjar, FullStory)",
        "Unapproved third-party commercial widgets",
      ]} />

      {/* 4 */}
      <LegalH2 id="managing">4. Managing cookies</LegalH2>
      <LegalP>
        Because all cookies used by {ORG_NAME} are strictly required to verify student and faculty identity,
        blocking or disabling them will prevent successful login to your dashboard.
      </LegalP>
      <LegalP>
        You can clear browser cookies at any time via your browser settings:
      </LegalP>
      <LegalUl items={[
        "Chrome: Settings → Privacy and security → Clear browsing data",
        "Firefox: Settings → Privacy & Security → Cookies and Site Data",
        "Safari: Settings → Safari → Clear History and Website Data",
        "Edge: Settings → Privacy, search, and services → Clear browsing data",
      ]} />
      <LegalCallout type="warning">
        Clearing your browser cookies will immediately log you out of AcadeX across active tabs.
      </LegalCallout>

      {/* 5 */}
      <LegalH2 id="changes">5. Changes to this policy</LegalH2>
      <LegalP>
        We will update this Cookie Policy if modern authentication standards require framework adjustments. The
        &quot;Last updated&quot; date at the top reflects the active version.
      </LegalP>

      {/* 6 */}
      <LegalH2 id="contact">6. Contact us</LegalH2>
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

