import Link from "next/link";

export function LandingFooter() {
  return (
    <footer
      className="px-6 py-12 text-xs text-neutral-600"
      style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex h-7 w-7 items-center justify-center rounded text-white"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <span className="text-xs font-bold">A</span>
              </div>
              <span className="font-bold text-neutral-900 text-sm">AcadeX</span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Comprehensive College Academic Project Management Platform. Standardizing team
              formation, SDG project proposals, milestone evaluation, and audit governance for higher education.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-xs mb-3">Academic Portals</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-neutral-900">Student Portal</Link></li>
              <li><Link href="/login" className="hover:text-neutral-900">Faculty Guide Portal</Link></li>
              <li><Link href="/login" className="hover:text-neutral-900">Administrator Console</Link></li>
              <li><Link href="/academics" className="hover:text-neutral-900">Academic Structure</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-xs mb-3">User Guides</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/student/guide" className="hover:text-neutral-900">Student User Guide</Link></li>
              <li><Link href="/faculty/guide" className="hover:text-neutral-900">Faculty User Guide</Link></li>
              <li><Link href="/about" className="hover:text-neutral-900">About the Architecture</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-xs mb-3">Legal &amp; Compliance</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-neutral-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-neutral-900">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-neutral-900">Cookie Policy</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-neutral-900">Acceptable Use Policy</Link></li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400 border-t"
          style={{ borderColor: "#e5e7eb" }}
        >
          <p>© 2026 AcadeX. College Academic Project Management Platform.</p>
          <p className="text-[11px]">Department of Computer Science &amp; Higher Education Institutions</p>
        </div>
      </div>
    </footer>
  );
}
