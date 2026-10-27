"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  IconArrowRight,
  IconArrowLeft,
  IconHome,
  IconSearch,
  IconStudent,
  IconFaculty,
  IconFileText,
  IconShield,
  IconScale,
  IconHelpCircle,
  IconCheck,
} from "@/components/ui/Icon";

interface PortalLink {
  title: string;
  category: string;
  description: string;
  href: string;
  icon: typeof IconStudent;
  badge?: string;
}

const PORTAL_LINKS: PortalLink[] = [
  {
    title: "Student Workspace",
    category: "Portals",
    description: "Access Capstone Project dashboard, team allocation requests, and SRS / PPT upload portals.",
    href: "/login",
    icon: IconStudent,
    badge: "Active Cohort",
  },
  {
    title: "Faculty & Guide Workspace",
    category: "Portals",
    description: "Mentorship review, rubrics-based defense grading, and milestone evaluation panels.",
    href: "/login",
    icon: IconFaculty,
    badge: "Staff & Reviewers",
  },
  {
    title: "Student Project Guide",
    category: "Documentation",
    description: "Phase-by-phase capstone milestones, SDG alignment guidelines, and submission rubrics.",
    href: "/student/guide",
    icon: IconFileText,
    badge: "Recommended",
  },
  {
    title: "Platform Architecture",
    category: "Institutional",
    description: "Explore the ISE Department engineering framework, cloud infrastructure, and contributors.",
    href: "/about",
    icon: IconShield,
  },
  {
    title: "Academic Honor Code",
    category: "Compliance",
    description: "Acceptable use guidelines, zero-plagiarism policies, and VTU evaluation protocols.",
    href: "/acceptable-use",
    icon: IconScale,
  },
  {
    title: "Privacy & Data Governance",
    category: "Compliance",
    description: "Official institutional data retention, marks security, and authentication practices.",
    href: "/privacy",
    icon: IconHelpCircle,
  },
];

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLinks = PORTAL_LINKS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-neutral-900 selection:bg-neutral-200">
      <LandingHeader />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Ambient Background Decor */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 120px, rgba(30, 58, 95, 0.12) 0%, rgba(14, 165, 233, 0.04) 35%, transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#1e3a5f 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-28">
          {/* Top Status Capsule */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200/90 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <Image
                src="/images/sahyadrilogo1.png"
                alt="Sahyadri Crest"
                width={18}
                height={18}
                className="h-4 w-auto object-contain"
              />
              <span className="text-neutral-500 font-medium">HTTP 404</span>
              <span className="text-neutral-300">•</span>
              <span style={{ color: "#1e3a5f" }}>Campus Resource Not Resolved</span>
            </div>
          </div>

          {/* Large Hero 404 Graphic */}
          <div className="text-center relative max-w-2xl mx-auto">
            {/* Ambient Backlight Aura */}
            <div
              className="absolute left-1/2 -top-8 -translate-x-1/2 w-72 h-36 blur-3xl opacity-30 rounded-full pointer-events-none"
              style={{ backgroundColor: "#1e3a5f" }}
            />

            <div className="relative select-none mb-3">
              <span
                className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter leading-none"
                style={{
                  background: "linear-gradient(180deg, #1e3a5f 20%, #2d5584 70%, #64748b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                404
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 mb-3.5">
              Lost in the Academic Repository?
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed mb-8">
              The page or milestone deliverable you requested could not be found. It may have been
              archived, moved to another semester cohort, or requires an authenticated college session.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:opacity-95 hover:shadow-sm cursor-pointer"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <IconHome size={15} />
                <span>Return to Home</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-white border border-neutral-300 text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <span>Access Portal Login</span>
                <IconArrowRight size={14} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.history.back();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors cursor-pointer"
              >
                <IconArrowLeft size={14} />
                <span>Go Back</span>
              </button>
            </div>
          </div>

          {/* Directory Section with Quick Search */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#1e3a5f" }} />
                  Direct Campus Directory
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Find your intended destination across Sahyadri Academic Portals
                </p>
              </div>

              {/* Real-time search filter */}
              <div className="relative w-full sm:w-72">
                <IconSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Filter portals or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-lg pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Cards Grid */}
            {filteredLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredLinks.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group p-4 rounded-xl border border-neutral-200/80 hover:border-[#1e3a5f]/40 hover:bg-neutral-50/60 transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="p-2.5 rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                          >
                            <IconComp size={18} />
                          </div>
                          {item.badge && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#1e3a5f] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group-hover:text-[#1e3a5f] transition-colors">
                        <span>{item.category}</span>
                        <IconArrowRight
                          size={13}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-neutral-600 mb-2">
                  No directory entry matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-[#1e3a5f] hover:underline cursor-pointer"
                >
                  Clear search query
                </button>
              </div>
            )}

            {/* Diagnostic Information Bar */}
            <div className="mt-8 pt-5 border-t border-neutral-100 rounded-xl bg-neutral-50/70 p-4 border border-neutral-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: "#16a34a" }}
                  />
                  <span className="font-semibold text-neutral-800">Campus Gateway Active:</span>
                  <span className="text-neutral-500">
                    Sahyadri College of Engineering &amp; Management (Autonomous)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-neutral-500">
                  <span className="flex items-center gap-1">
                    <IconCheck size={13} style={{ color: "#16a34a" }} />
                    Dept of ISE
                  </span>
                  <span>•</span>
                  <span>
                    Need assistance?{" "}
                    <a
                      href="mailto:info@sahyadri.edu.in"
                      className="font-semibold hover:underline cursor-pointer"
                      style={{ color: "#1e3a5f" }}
                    >
                      info@sahyadri.edu.in
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
