import { stats } from "./landing-data";

export function LandingStats() {
  return (
    <section
      className="py-6 sm:py-7 text-white"
      style={{
        backgroundColor: "#111f3a",
        borderTop: "1px solid #1d3159",
        borderBottom: "1px solid #1d3159",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="border-l-2 pl-3.5 sm:pl-4 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: "#38bdf8" }}
            >
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-100 mt-1">
                {s.label}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
