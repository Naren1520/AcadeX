import Link from "next/link";

export function LandingCta() {
  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div
        className="rounded-2xl p-8 sm:p-12 text-center"
        style={{
          backgroundColor: "#1e3a5f",
          color: "#ffffff",
        }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Ready to streamline your academic semester?
        </h2>
        <p className="mt-3 text-neutral-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Sign in with your institutional credentials to access your student, mentor, or coordinator dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded px-6 py-3 text-sm font-semibold text-neutral-900 bg-white hover:bg-neutral-100 transition-colors"
          >
            Sign In to AcadeX
          </Link>
          <Link
            href="/about"
            className="rounded px-6 py-3 text-sm font-semibold text-white border border-neutral-400 hover:bg-neutral-800 transition-colors"
          >
            About Platform
          </Link>
        </div>
      </div>
    </section>
  );
}
