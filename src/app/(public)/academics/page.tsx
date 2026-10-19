import Link from "next/link";

export default function AcademicsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <Link href="/" className="text-xl font-bold" style={{ color: "#1e3a5f" }}>AcadeX</Link>
        <Link href="/login" className="rounded px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#1e3a5f" }}>Sign In</Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900">Academic Programmes</h1>
        <p className="mt-4 text-neutral-600">
          Academic structure information is managed by administrators within the platform.
          Sign in to access your department, semester, and section details.
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
