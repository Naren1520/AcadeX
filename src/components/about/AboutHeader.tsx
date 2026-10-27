import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icon";

export function AboutHeader() {
  return (
    <header
      className="sticky top-0 z-40 w-full bg-white"
      style={{ borderBottom: "1px solid #e5e7eb" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5">
        <Link href="/" className="flex items-center shrink-0 min-w-0">
          {/* Mobile: compact shield emblem + AcadeX */}
          <div className="flex items-center gap-2 sm:hidden">
            <Image
              src="/images/sahyadrilogo1.png"
              alt="Sahyadri Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain shrink-0"
              priority
            />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight tracking-tight" style={{ color: "#1e3a5f" }}>
                AcadeX
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                Academic Portal
              </span>
            </div>
          </div>

          {/* Tablet & Desktop: full Sahyadri logo + divider + AcadeX */}
          <div className="hidden sm:flex items-center gap-3">
            <Image
              src="/images/sahyadrilogo.png"
              alt="Sahyadri College of Engineering & Management"
              width={200}
              height={40}
              className="h-9 md:h-10 w-auto object-contain"
              priority
            />
            <div className="h-6 w-[1px] bg-neutral-200" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold leading-tight" style={{ color: "#1e3a5f" }}>
                AcadeX
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Academic Platform
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium shrink-0 ml-2">
          <Link
            href="/"
            className="text-neutral-600 hover:text-neutral-900 transition-colors hidden xs:inline-block"
          >
            ← Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-95"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <span>Sign In</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}
