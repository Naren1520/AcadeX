import { projectMeta } from "./about-data";

export function AboutHero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-14 pb-10 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        About <span style={{ color: "#1e3a5f" }}>AcadeX</span>
      </h1>

      <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
        {projectMeta.subtitle}
      </p>

      {/* Academic Affiliation Card */}
      <div
        className="mt-8 rounded-xl p-5 text-left bg-white"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-neutral-400">
              Academic Context
            </p>
            <p className="text-base font-bold text-neutral-900 mt-0.5">
              {projectMeta.department}
            </p>
            <p className="text-xs text-neutral-500">
              {projectMeta.institution} • {projectMeta.institutionTag}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              {projectMeta.semester}
            </span>
            <span
              className="rounded px-2.5 py-1 text-xs font-semibold text-neutral-700"
              style={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}
            >
              {projectMeta.section}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {projectMeta.summary}
        </p>
      </div>
    </section>
  );
}
