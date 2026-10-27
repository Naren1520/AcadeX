import Link from "next/link";

export function AboutFooter() {
  return (
    <footer
      className="px-6 py-10 text-xs text-neutral-500 mt-12"
      style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-neutral-900">
            AcadeX • Department of Information Science &amp; Engineering
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Sahyadri College of Engineering &amp; Management (Autonomous), Mangaluru
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <Link href="/student/guide" className="hover:text-neutral-900 transition-colors">
            Student Guide
          </Link>
          <Link href="/faculty/guide" className="hover:text-neutral-900 transition-colors">
            Faculty Guide
          </Link>
          <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-900 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
