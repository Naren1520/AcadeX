"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icon";

const tickerSentences = [
  "AcadeX — College Academic Project Management & Governance Platform",
  "Sahyadri College of Engineering & Management (Autonomous), Mangaluru",
  "Enforcing CGPA Balanced Teams, SDG Alignments, Milestone Verification & Tamper-Resistant Audit Logs",
  "Department of Information Science & Engineering • Department of Computer Science & Engineering • Department of Computer Science & Engineering(AIML) • Department of Electronics & Communication Engineering  • Department of Mechanical Engineering  • Department of Robotics & Automation Engineering",
];

export function LandingHeader({
  scrolled,
  scrollProgress,
}: {
  scrolled: boolean;
  scrollProgress: number;
}) {
  return (
    <>
      <style>{`
        @keyframes tickerRtl {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker-rtl {
          display: flex;
          width: max-content;
          animation: tickerRtl 45s linear infinite;
        }
        .animate-ticker-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="fixed top-0 left-0 h-[3px] z-50 transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: "#1e3a5f",
        }}
        aria-hidden="true"
      />

      {/* Institutional Top Ticker Bar (Scrolls with page, sentences moving right-to-left) */}
      <div
        className="w-full overflow-hidden text-neutral-200 select-none py-2.5 sm:py-3"
        style={{ backgroundColor: "#132840", borderBottom: "1px solid #1e3a5f" }}
      >
        <div className="animate-ticker-rtl flex items-center gap-10 text-xs tracking-wide">
          {/* First set */}
          {tickerSentences.map((sentence, idx) => (
            <div key={`s1-${idx}`} className="flex items-center gap-8 shrink-0">
              <span className="text-neutral-200 font-medium">{sentence}</span>
              <span className="text-amber-400 text-[10px]">◆</span>
            </div>
          ))}
          {/* Second set for seamless looping */}
          {tickerSentences.map((sentence, idx) => (
            <div key={`s2-${idx}`} className="flex items-center gap-8 shrink-0">
              <span className="text-neutral-200 font-medium">{sentence}</span>
              <span className="text-amber-400 text-[10px]">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navbar (Sticky when scrolling) */}
      <header
        className={`sticky top-0 z-40 w-full bg-white transition-shadow ${scrolled ? "shadow-sm" : ""
          }`}
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/sahyadrilogo.png"
              alt="Sahyadri College of Engineering & Management"
              width={200}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold leading-tight" style={{ color: "#1e3a5f" }}>
                AcadeX
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Academic Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Sign In
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
