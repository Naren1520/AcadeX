import Link from "next/link";
import { IconStudent, IconFaculty, IconArrowRight } from "@/components/ui/Icon";

export function LandingGuidesBanner() {
  return (
    <section
      id="guides"
      className="py-16"
      style={{
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Official User Documentation
          </h2>
          <p className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Step-by-Step Portal Guides
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            Exhaustive documentation covering every interface, action, and edge-case resolution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div
            className="rounded-xl p-6 bg-white"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded"
                style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
              >
                <IconStudent size={18} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Student Guide</h3>
                <p className="text-[11px] text-neutral-500">Complete workflows for project batches</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Step-by-step procedures for login, finding teammates, sending invitations, submitting proposals with SDG tags, and uploading GitHub repositories.
            </p>
            <Link
              href="/student/guide"
              className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
              style={{ color: "#1e3a5f" }}
            >
              Read Student Guide
              <IconArrowRight size={12} />
            </Link>
          </div>

          <div
            className="rounded-xl p-6 bg-white"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded"
                style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
              >
                <IconFaculty size={18} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Faculty Guide</h3>
                <p className="text-[11px] text-neutral-500">Comprehensive mentor manual</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Detailed protocols for reviewing and approving proposals, defining submission windows, setting rubrics, marks entry, and batch coordination.
            </p>
            <Link
              href="/faculty/guide"
              className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
              style={{ color: "#1e3a5f" }}
            >
              Read Faculty Guide
              <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
