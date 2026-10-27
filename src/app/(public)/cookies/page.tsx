import type { Metadata } from "next";
import {
  LegalLayout, LegalToc, LegalH2, LegalH3,
  LegalP, LegalUl, LegalCallout,
  EFFECTIVE_DATE, ORG_NAME,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy — AcadeX",
  description:
    "Information about how AcadeX uses cookies and similar technologies.",
};

const toc = [
  { id: "what-are-cookies", label: "What are cookies?" },
  { id: "cookies-we-use",   label: "Cookies we use" },
  { id: "no-tracking",      label: "No third-party tracking" },
  { id: "managing",         label: "Managing cookies" },
  { id: "changes",          label: "Changes to this policy" },
];

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated={EFFECTIVE_DATE}>
      <LegalCallout type="info">
        {ORG_NAME} uses a minimal set of cookies — only those strictly necessary to keep
        you securely logged in. We do not use advertising or analytics tracking cookies.
      </LegalCallout>

      <LegalToc entries={toc} />

      {/* 1 */}
      <LegalH2 id="what-are-cookies">1. What are cookies?</LegalH2>
      <LegalP>
        Cookies are small text files placed on your device by a website. They are widely
        used to make websites work efficiently and to provide information to the site
        owner. Cookies set by the website you visit are called &quot;first-party cookies&quot;;
        those set by other parties are called &quot;third-party cookies&quot;.
      </LegalP>

      {/* 2 */}
      <LegalH2 id="cookies-we-use">2. Cookies we use</LegalH2>
      <LegalP>
        {ORG_NAME} uses only <strong>strictly necessary (essential) cookies</strong>.
        These cannot be disabled without breaking the platform&apos;s core functionality.
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
              ["sb-access-token",  "Authenticates your current session (JWT)",       "Session / 1 hour",  "HTTP-only, Secure"],
              ["sb-refresh-token", "Renews your session without re-login",            "7 days",            "HTTP-only, Secure"],
              ["sb-auth-token",    "Backup token for some Supabase SDK flows",        "Session",           "HTTP-only, Secure"],
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
        cannot be read by JavaScript and are only transmitted over HTTPS. This protects
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
              ["__nextjs_*", "Next.js framework internals (routing, hydration)",  "Session"],
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
        {ORG_NAME} does <strong>not</strong> use:
      </LegalP>
      <LegalUl items={[
        "Google Analytics or any web analytics service",
        "Facebook Pixel or any social media tracking",
        "Advertising or remarketing cookies",
        "Heatmap or session-recording tools (e.g., Hotjar, FullStory)",
        "Third-party chat widgets",
      ]} />

      {/* 4 */}
      <LegalH2 id="managing">4. Managing cookies</LegalH2>
      <LegalP>
        Because all cookies used by {ORG_NAME} are strictly necessary for
        authentication, disabling them will prevent you from logging in.
      </LegalP>
      <LegalP>
        You can manage or delete cookies through your browser settings:
      </LegalP>
      <LegalUl items={[
        "Chrome: Settings → Privacy and security → Cookies and other site data",
        "Firefox: Settings → Privacy & Security → Cookies and Site Data",
        "Safari: Preferences → Privacy → Manage Website Data",
        "Edge: Settings → Cookies and site permissions → Cookies and site data",
      ]} />
      <LegalCallout type="warning">
        Clearing cookies will log you out of {ORG_NAME}. You will need to log in again
        the next time you visit.
      </LegalCallout>

      {/* 5 */}
      <LegalH2 id="changes">5. Changes to this policy</LegalH2>
      <LegalP>
        We will update this Cookie Policy if we introduce new cookies or change how
        existing cookies are used. The &quot;Last updated&quot; date at the top of this page
        will reflect any changes.
      </LegalP>
    </LegalLayout>
  );
}
