import Link from "next/link";
import { IconStudent, IconFaculty, IconArrowRight } from "@/components/ui/Icon";
import { roles, RoleInfo } from "./landing-data";

function RoleIcon({ type }: { type: RoleInfo["iconType"] }) {
  if (type === "student") return <IconStudent size={22} />;
  if (type === "faculty") return <IconFaculty size={22} />;
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

export function LandingRoles() {
  return (
    <section
      id="roles"
      className="py-20"
      style={{
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Tailored Academic Experience
          </h2>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-2">
            Designed for Every University Stakeholder
          </p>
          <p className="text-sm text-neutral-600 mt-3">
            Dedicated interfaces crafted specifically for student teams, faculty mentors, and departmental authorities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.role}
              className="rounded-xl bg-white p-7 flex flex-col justify-between"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div>
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                  aria-hidden="true"
                >
                  <RoleIcon type={r.iconType} />
                </div>

                <h3 className="text-lg font-bold text-neutral-900">{r.role}</h3>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#1e3a5f" }}>
                  {r.tagline}
                </p>
                <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                  {r.description}
                </p>

                <div className="mt-6 pt-5 border-t border-neutral-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                    Key Capabilities
                  </p>
                  <ul className="space-y-2">
                    {r.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                        <span className="text-neutral-400 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={r.target}
                  className="inline-flex w-full items-center justify-center gap-2 rounded py-2.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 transition-colors"
                  style={{ border: "1px solid #d1d5db", backgroundColor: "#f9fafb" }}
                >
                  {r.ctaText}
                  <IconArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
