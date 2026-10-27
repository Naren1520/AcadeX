import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  IconShield,
  IconFileText,
  IconCookie,
  IconScale,
  IconList,
  IconInfo,
  IconAlertTriangle,
} from "@/components/ui/Icon";

export const EFFECTIVE_DATE = "27 October 2026";
export const CONTACT_EMAIL = "info@sahyadri.edu.in";
export const PRINCIPAL_EMAIL = "principal@sahyadri.edu.in";
export const ORG_NAME = "AcadeX";
export const ORG_FULL = "AcadeX — Sahyadri College of Engineering & Management";
export const COLLEGE_NAME = "Sahyadri College of Engineering & Management (Autonomous), Mangaluru";
export const DEPT_NAME = "Department of Information Science & Engineering";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy", icon: IconShield },
  { label: "Terms of Service", href: "/terms", icon: IconFileText },
  { label: "Cookie Policy", href: "/cookies", icon: IconCookie },
  { label: "Acceptable Use", href: "/acceptable-use", icon: IconScale },
];

// ── Prose section heading ─────────────────────────────────────────────────────
export function LegalH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-base sm:text-lg font-bold text-neutral-900 mt-10 mb-3.5 pt-4 border-t border-neutral-200/70 scroll-mt-24 flex items-center gap-2.5"
    >
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "#1e3a5f" }} />
      <span>{children}</span>
    </h2>
  );
}

export function LegalH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm sm:text-base font-semibold text-neutral-800 mt-6 mb-2">
      {children}
    </h3>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-600 leading-relaxed mb-3.5">{children}</p>;
}

export function LegalUl({ items }: { items: string[] }) {
  return (
    <ul className="mb-5 space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-neutral-600 leading-relaxed flex items-start gap-2.5">
          <span
            className="h-1.5 w-1.5 rounded-full mt-2 shrink-0"
            style={{ backgroundColor: "#1e3a5f" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalCallout({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "warning";
}) {
  const isWarning = type === "warning";
  return (
    <div
      className="rounded-lg p-4 mb-6 text-sm border-l-4 flex items-start gap-3 shadow-xs"
      style={{
        backgroundColor: isWarning ? "#fffbeb" : "#eff6ff",
        borderColor: isWarning ? "#d97706" : "#1e3a5f",
        color: isWarning ? "#92400e" : "#1e3a5f",
      }}
    >
      <div className="shrink-0 mt-0.5">
        {isWarning ? (
          <IconAlertTriangle size={18} className="text-amber-600" />
        ) : (
          <IconInfo size={18} className="text-[#1e3a5f]" />
        )}
      </div>
      <div className="leading-relaxed flex-1">{children}</div>
    </div>
  );
}

// ── Table of contents ─────────────────────────────────────────────────────────
export function LegalToc({ entries }: { entries: { id: string; label: string }[] }) {
  return (
    <nav
      className="rounded-xl p-5 mb-8 bg-neutral-50/80 border"
      style={{ borderColor: "#e5e7eb" }}
      aria-label="Table of contents"
    >
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-neutral-200/80">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
          <IconList size={16} className="text-[#1e3a5f]" />
          <span>Document Sections</span>
        </p>
        <span className="text-[11px] text-neutral-400 font-medium">{entries.length} Topics</span>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {entries.map((e, i) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="text-xs sm:text-sm hover:text-[#1e3a5f] hover:bg-white px-2 py-1.5 rounded transition-all flex items-baseline gap-2 group"
              style={{ color: "#374151" }}
            >
              <span className="text-[11px] font-semibold font-mono tabular-nums text-neutral-400 group-hover:text-[#1e3a5f]">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span className="group-hover:underline">{e.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Main layout shell ─────────────────────────────────────────────────────────
export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Landing Page Header (with Institutional Ticker & Sahyadri branding) ── */}
      <LandingHeader />

      {/* ── Guide-Style 2-Column Container ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Sidebar (Sticky on scroll) ── */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 z-20 self-start">
            <div
              className="rounded-xl border overflow-hidden shadow-xs bg-white"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Legal Documents
                </p>
                <span className="text-[10px] text-slate-300 font-mono">4 Policies</span>
              </div>

              <nav className="flex flex-col divide-y divide-neutral-100">
                {legalLinks.map((l, i) => {
                  const isActive = title.startsWith(l.label) || l.label === title;
                  const IconComp = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="px-4 py-3 text-left text-xs sm:text-sm transition-colors flex items-center justify-between group"
                      style={{
                        backgroundColor: isActive
                          ? "#eff6ff"
                          : i % 2 === 0
                          ? "#ffffff"
                          : "#f9fafb",
                        color: isActive ? "#1e3a5f" : "#374151",
                        fontWeight: isActive ? "600" : "400",
                        borderLeft: isActive
                          ? "4px solid #1e3a5f"
                          : "4px solid transparent",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp
                          size={16}
                          className={
                            isActive
                              ? "text-[#1e3a5f]"
                              : "text-neutral-400 group-hover:text-neutral-600"
                          }
                        />
                        <span>{l.label}</span>
                      </div>
                      {isActive && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: "#1e3a5f" }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Institutional Compliance Card */}
              <div
                className="p-4 bg-neutral-50/70 border-t text-xs space-y-2.5"
                style={{ borderColor: "#e5e7eb" }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/sahyadrilogo1.png"
                    alt="Sahyadri Shield"
                    width={22}
                    height={22}
                    className="h-5 w-auto object-contain shrink-0"
                  />
                  <div className="leading-tight">
                    <span className="block font-semibold text-neutral-900 text-xs">
                      Sahyadri Campus
                    </span>
                    <span className="block text-[10px] text-neutral-500">
                      Autonomous Governance
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Academic policies enforced by the Department of Information Science &amp; Engineering.
                </p>
                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Contact:</span>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-medium hover:underline"
                    style={{ color: "#1e3a5f" }}
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Document Area (Card styled just like the Guide page) ── */}
          <main className="flex-1 min-w-0 w-full">
            <div
              className="bg-white border rounded-xl p-6 sm:p-10 shadow-xs"
              style={{ borderColor: "#e5e7eb" }}
            >
              {/* Document Header Banner */}
              <div className="pb-6 mb-8 border-b" style={{ borderColor: "#e5e7eb" }}>
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                  >
                    Official Policy
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-xs text-neutral-500">
                    Last updated: <strong className="text-neutral-800 font-medium">{lastUpdated}</strong>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {title}
                </h1>
                <div
                  className="mt-3.5 h-1 w-20 rounded"
                  style={{ backgroundColor: "#1e3a5f" }}
                />
              </div>

              {/* Document Content */}
              <div>{children}</div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}

