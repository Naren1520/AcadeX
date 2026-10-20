import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <Link href="/" className="text-xl font-bold" style={{ color: "#1e3a5f" }}>AcadeX</Link>
        <Link href="/login" className="rounded px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#1e3a5f" }}>Sign In</Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900">About AcadeX</h1>
        <p className="mt-4 text-neutral-600">
          AcadeX is a production-oriented College Academic Project Management Platform built on
          Next.js 15, TypeScript, Supabase, and Tailwind CSS.
        </p>
        <p className="mt-3 text-neutral-600">
          It manages academic project team formation with CGPA-based eligibility,
          project proposals and approvals, SDG (Sustainable Development Goals) selection,
          milestone tracking, artefact submissions, and a tamper-resistant audit trail.
        </p>
        <div className="mt-8">
          <Link href="/login" className="rounded px-6 py-3 text-sm font-medium text-white" style={{ backgroundColor: "#1e3a5f" }}>
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
