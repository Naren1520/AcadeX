import Link from "next/link";
import { IconSettings, IconFaculty, IconStudent } from "@/components/ui/Icon";

const features = [
  {
    role: "Admin",
    description: "Configure departments, academic years, semesters, sections, and faculty assignments. Access the full audit log.",
    icon: <IconSettings size={22} />,
  },
  {
    role: "Faculty",
    description: "Define CGPA-based team formation rules, supervise project proposals, create milestones, and manage submission windows.",
    icon: <IconFaculty size={22} />,
  },
  {
    role: "Student",
    description: "Form a team, submit project proposals with SDG alignment, upload artefacts, and track milestone progress.",
    icon: <IconStudent size={22} />,
  },
];

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <span className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
          AcadeX
        </span>
        <Link
          href="/login"
          className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1
            className="text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: "#111827" }}
          >
            College Academic Management,{" "}
            <span style={{ color: "#1e3a5f" }}>simplified.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500">
            AcadeX manages the full academic workflow — from CGPA-based team
            formation and SDG-aligned project proposals to milestone tracking,
            artefact submissions, and a complete audit trail.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded px-6 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Sign In to Your Dashboard
            </Link>
            <Link
              href="/about"
              className="rounded px-6 py-3 text-sm font-medium text-neutral-700"
              style={{ border: "1px solid #e5e7eb" }}
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Role feature cards */}
        <section
          className="py-16"
          style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-5xl px-6">
            <h2
              id="features-heading"
              className="mb-10 text-center text-2xl font-semibold"
              style={{ color: "#111827" }}
            >
              Built for every role
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.role}
                  className="rounded-lg bg-white p-6"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "#f0f4ff", color: "#1e3a5f" }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-neutral-900">{f.role}</h3>
                  <p className="text-sm text-neutral-500">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Ready to get started?
          </h2>
          <p className="mt-2 text-neutral-500">
            Sign in with your institutional credentials to access your dashboard.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            Sign In
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-4 text-center text-xs text-neutral-400"
        style={{ borderTop: "1px solid #e5e7eb" }}
      >
        © 2026 AcadeX. College Academic Project Management Platform.
      </footer>
    </div>
  );
}
