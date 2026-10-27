import React from "react";

export function LandingWorkspacePreview() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
          Live Portal Simulation
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1.5 sm:mt-2">
          Experience the AcadeX Capstone Console
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 sm:mt-2">
          Real-time role-based governance from team formation to milestone evaluation.
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        <div
          className="rounded-xl overflow-hidden bg-white shadow-sm"
          style={{ border: "1px solid #e5e7eb" }}
        >
          {/* Browser Window Header */}
          <div
            className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3"
            style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-neutral-300 shrink-0" />
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-neutral-300 shrink-0" />
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-neutral-300 shrink-0" />
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs font-mono text-neutral-500 truncate">
                acadex.edu.in/portal/overview
              </span>
            </div>
            <span
              className="rounded px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-semibold text-neutral-700 shrink-0 ml-2"
              style={{ backgroundColor: "#e5e7eb" }}
            >
              Live Workspace
            </span>
          </div>

          {/* Console Dashboard Content */}
          <div className="p-3.5 sm:p-6 md:p-8">
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-3.5 sm:mb-6">
              <div
                className="rounded p-2.5 sm:p-4"
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Active Teams</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1" style={{ color: "#1e3a5f" }}>
                  48
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 truncate">
                  100% Verified Members
                </p>
              </div>
              <div
                className="rounded p-2.5 sm:p-4"
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Proposals Approved</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1" style={{ color: "#16a34a" }}>
                  42
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 truncate">
                  6 Under Revision
                </p>
              </div>
              <div
                className="rounded p-2.5 sm:p-4"
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Active Window</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1" style={{ color: "#d97706" }}>
                  M-2
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 truncate">
                  SRS &amp; Architecture
                </p>
              </div>
              <div
                className="rounded p-2.5 sm:p-4"
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                <p className="text-[10px] sm:text-xs font-medium text-neutral-500">Audit Events</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 text-neutral-900">
                  1,492
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 truncate">
                  Zero discrepancies
                </p>
              </div>
            </div>

            {/* Active Team Detail Card */}
            <div
              className="rounded-lg p-3 sm:p-5"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
            >
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b"
                style={{ borderColor: "#f3f4f6" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900 text-xs sm:text-sm truncate">
                      Team: Naren and team
                    </span>
                    <span
                      className="rounded px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs font-medium shrink-0"
                      style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                    >
                      ISE-SEM5-SEC-B
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">
                    Supervisor: Dr. Rithesh Pakkala P • Milestone 2 Submissions Verified
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span
                    className="rounded px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                  >
                    Proposal Approved
                  </span>
                  <span
                    className="rounded px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium"
                    style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                  >
                    SDG 7 &amp; 9
                  </span>
                </div>
              </div>

              {/* 3 Verification Metric Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs text-neutral-600">
                <div className="p-2.5 sm:p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">Repository Sync</p>
                  <p className="font-mono text-neutral-800 text-xs mt-0.5 sm:mt-1 truncate">
                    github.com/Naren1520/acadex
                  </p>
                  <p className="text-neutral-500 text-[10px] sm:text-[11px] mt-0.5">
                    Latest commit: 20 mins ago
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">SRS Document</p>
                  <p className="font-medium text-neutral-800 text-xs mt-0.5 sm:mt-1 truncate">
                    Architecture_Spec_v2.pdf
                  </p>
                  <p className="text-neutral-500 text-[10px] sm:text-[11px] mt-0.5">
                    4.8 MB • Hash Verified
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium">Internal Evaluation</p>
                  <p className="font-semibold text-neutral-900 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    29 / 30 Rubric Marks
                  </p>
                  <p className="text-neutral-500 text-[10px] sm:text-[11px] mt-0.5">
                    Guide feedback submitted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
