import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer
      className="px-4 sm:px-6 py-12 text-xs text-slate-300"
      style={{
        backgroundColor: "#111f3a",
        borderTop: "1px solid #1d3159",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/images/sahyadrilogo1.png"
                alt="Sahyadri Logo"
                width={28}
                height={28}
                className="h-7 w-auto object-contain"
              />
              <span className="font-bold text-white text-sm">AcadeX</span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Comprehensive College Academic Project Management Platform. Standardizing team
              formation, SDG project proposals, milestone evaluation, and audit governance for higher education.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white text-xs mb-3">Academic Portals</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Faculty Guide Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Administrator Console
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-slate-300 hover:text-white transition-colors">
                  Academic Structure
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white text-xs mb-3">User Guides</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/student/guide" className="text-slate-300 hover:text-white transition-colors">
                  Student User Guide
                </Link>
              </li>
              <li>
                <Link href="/faculty/guide" className="text-slate-300 hover:text-white transition-colors">
                  Faculty User Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                  About the Architecture
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white text-xs mb-3">Legal &amp; Compliance</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-300 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-slate-300 hover:text-white transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 border-t"
          style={{ borderColor: "#1d3159" }}
        >
          <p>© 2026 AcadeX. College Academic Project Management Platform.</p>
          <p className="text-[11px]">Department of Information Science &amp; Engineering</p>
        </div>
      </div>
    </footer>
  );
}


