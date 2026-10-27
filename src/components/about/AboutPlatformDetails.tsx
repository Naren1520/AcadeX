import { platformHighlights } from "./about-data";

export function AboutPlatformDetails() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Core Capabilities
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 mt-1">
          Engineered for Institutional Rigor
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {platformHighlights.map((h, i) => (
          <div
            key={i}
            className="rounded-lg p-5 bg-white"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <h3 className="text-sm font-bold text-neutral-900 mb-1">{h.title}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-6 rounded-lg p-5 text-xs text-neutral-600 leading-relaxed bg-white"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <p className="font-semibold text-neutral-900 mb-1">Architecture &amp; Security</p>
        <p>
          AcadeX is implemented with Next.js App Router, TypeScript, and Supabase PostgreSQL.
          All data transactions enforce strict Row-Level Security (RLS) policies ensuring students, faculty
          mentors, and administrators access only authorized institutional records.
        </p>
      </div>
    </section>
  );
}
