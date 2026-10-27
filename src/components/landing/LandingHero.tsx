import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icon";
import { PixelRunnerLoader } from "./PixelRunnerLoader";

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Sahyadri Campus Aerial Photograph Background (z-0, above bg-white) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero-bg.jpeg"
          alt="Sahyadri College Campus Aerial View"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft light gradient overlay for contrast while keeping the campus and river beautifully visible */}
        <div className="absolute inset-0 bg-white/75 sm:bg-white/70 lg:bg-gradient-to-r lg:from-white/92 lg:via-white/80 lg:to-white/50" />
      </div>

      {/* Main Single-Desktop-Height Container (z-10, sits cleanly above the background) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-105px)] flex items-center py-8 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">

          {/* Left Column: Heading, Subtitle, Actions */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            {/* Headline */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-black tracking-tight leading-[1.12]"
              style={{ color: "#111827" }}
            >
              Academic Project Management,{" "}
              <span style={{ color: "#1e3a5f" }}>simplified.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed max-w-xl font-medium">
              AcadeX coordinates the complete university capstone lifecycle from
              rule-based team formation and SDG-aligned proposals to milestone
              enforcement, code verification, and audit-ready academic compliance.
            </p>

            {/* Action Button */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:opacity-95 hover:shadow-sm"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <span>Access Your Dashboard</span>
                <IconArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Frame containing the Pixel Animated Loader (Light white shade, no shadow) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[370px] xl:max-w-[400px]">
              {/* Card Container Frame */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 bg-white/95 backdrop-blur-md p-2 sm:p-2.5">
                <div className="relative w-full aspect-[4/3.8] rounded-xl sm:rounded-2xl overflow-hidden bg-[#f8fafc]/90 border border-neutral-100 flex items-center justify-center">
                  <PixelRunnerLoader />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
