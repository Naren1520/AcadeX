import Link from "next/link";

export const EFFECTIVE_DATE = "27 October 2026";
export const CONTACT_EMAIL = "legal@acadex.edu.in";
export const ORG_NAME = "AcadeX";
export const ORG_FULL = "AcadeX College Academic Management Platform";

const legalLinks = [
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy",    href: "/cookies" },
  { label: "Acceptable Use",   href: "/acceptable-use" },
];

// ── Prose section heading ─────────────────────────────────────────────────────
export function LegalH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-lg font-semibold text-neutral-900 mt-10 mb-3 scroll-mt-6"
    >
      {children}
    </h2>
  );
}

export function LegalH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-neutral-800 mt-6 mb-2">{children}</h3>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-600 leading-relaxed mb-3">{children}</p>;
}

export function LegalUl({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-neutral-600 leading-relaxed list-disc">
          {item}
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
  const s =
    type === "warning"
      ? { bg: "#fef3c7", border: "#fde68a", color: "#92400e" }
      : { bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a5f" };
  return (
    <div
      className="rounded-lg px-4 py-3 mb-4 text-sm"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </div>
  );
}

// ── Table of contents ─────────────────────────────────────────────────────────
export function LegalToc({ entries }: { entries: { id: string; label: string }[] }) {
  return (
    <nav
      className="rounded-xl p-4 mb-8"
      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
      aria-label="Table of contents"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
        Contents
      </p>
      <ol className="space-y-1">
        {entries.map((e, i) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="text-sm hover:underline flex gap-2"
              style={{ color: "#1e3a5f" }}
            >
              <span className="text-neutral-400 tabular-nums">{i + 1}.</span>
              {e.label}
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
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <Link href="/" className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
          AcadeX
        </Link>
        <Link
          href="/login"
          className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          Sign In
        </Link>
      </header>

      {/* ── Legal quick nav ── */}
      <div
        className="px-6 py-2.5 flex flex-wrap gap-x-5 gap-y-1"
        style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
      >
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:underline"
        >
          ← Home
        </Link>
        {legalLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs hover:underline"
            style={{ color: "#1e3a5f" }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* ── Page content ── */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-2 text-xs text-neutral-400">Last updated: {lastUpdated}</p>
        <div
          className="mt-2 mb-8 h-0.5 w-16 rounded"
          style={{ backgroundColor: "#1e3a5f" }}
        />
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 text-center"
        style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
      >
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-neutral-500 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} AcadeX. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
