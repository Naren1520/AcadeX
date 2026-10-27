import { stats } from "./landing-data";

export function LandingStats() {
  return (
    <section
      className="py-12"
      style={{
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="border-l-2 pl-4" style={{ borderColor: "#1e3a5f" }}>
              <p className="text-3xl font-bold tracking-tight" style={{ color: "#1e3a5f" }}>
                {s.value}
              </p>
              <p className="text-sm font-semibold text-neutral-900 mt-1">{s.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
