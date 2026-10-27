import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/ui/Icon";

export function LandingHero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]"
          style={{ color: "#111827" }}
        >
          Academic Project Management,{" "}
          <span style={{ color: "#1e3a5f" }}>simplified.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          AcadeX coordinates the complete university capstone lifecycle — from
          rule-based team formation and SDG-aligned proposals to milestone
          enforcement, code verification, and audit-ready academic compliance.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            Access Your Dashboard
            <IconArrowRight size={16} />
          </Link>
          <a
            href="#workflow"
            className="inline-flex items-center gap-2 rounded px-6 py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            style={{ border: "1px solid #d1d5db" }}
          >
            Explore Workflow
          </a>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <IconCheck size={14} style={{ color: "#1e3a5f" }} />
            Role-Based Portals
          </span>
          <span className="flex items-center gap-1.5">
            <IconCheck size={14} style={{ color: "#1e3a5f" }} />
            Zero Spreadsheets
          </span>
          <span className="flex items-center gap-1.5">
            <IconCheck size={14} style={{ color: "#1e3a5f" }} />
            Immutable Audit Log
          </span>
        </div>
      </div>

      {/* Simulated Live Workspace UI Preview */}
      <div className="mt-14 mx-auto max-w-5xl">
        <div
          className="rounded-xl overflow-hidden bg-white shadow-sm"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
              <span className="h-3 w-3 rounded-full bg-neutral-300" />
              <span className="ml-2 text-xs font-mono text-neutral-500">
                acadex.edu.in/portal/overview
              </span>
            </div>
            <span
              className="rounded px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700"
              style={{ backgroundColor: "#e5e7eb" }}
            >
              Live Workspace
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-xs font-medium text-neutral-500">Active Teams</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#1e3a5f" }}>48</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">100% Verified Members</p>
              </div>
              <div className="rounded p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-xs font-medium text-neutral-500">Proposals Approved</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#16a34a" }}>42</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">6 Under Revision</p>
              </div>
              <div className="rounded p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-xs font-medium text-neutral-500">Active Window</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#d97706" }}>M-2</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">SRS & Architecture</p>
              </div>
              <div className="rounded p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-xs font-medium text-neutral-500">Audit Events</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#111827" }}>1,492</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Zero discrepancies</p>
              </div>
            </div>

            <div
              className="rounded-lg p-5"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b" style={{ borderColor: "#f3f4f6" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 text-sm">
                      Team: Autonomous Solar UAV
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                    >
                      CSE-SEM7-SEC-A
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Supervisor: Dr. S. Narayanan • Milestone 2 Submissions Verified
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                  >
                    Proposal Approved
                  </span>
                  <span
                    className="rounded px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                  >
                    SDG 7 &amp; 9
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                <div className="p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-neutral-400 font-medium">Repository Sync</p>
                  <p className="font-mono text-neutral-800 mt-1 truncate">github.com/acadex/uav-core</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Latest commit: 42 mins ago</p>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-neutral-400 font-medium">SRS Document</p>
                  <p className="font-medium text-neutral-800 mt-1 truncate">Architecture_Spec_v2.pdf</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">4.8 MB • Hash Verified</p>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-neutral-400 font-medium">Internal Evaluation</p>
                  <p className="font-semibold text-neutral-900 mt-1">29 / 30 Rubric Marks</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Guide feedback submitted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
