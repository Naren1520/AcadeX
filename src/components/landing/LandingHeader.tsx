"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icon";

export function LandingHeader({
  scrolled,
  scrollProgress,
}: {
  scrolled: boolean;
  scrollProgress: number;
}) {
  return (
    <>
      <div
        className="fixed top-0 left-0 h-[3px] z-50 transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: "#1e3a5f",
        }}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-40 w-full bg-white transition-shadow ${
          scrolled ? "shadow-sm" : ""
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
