"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icon";
import { PixelRunnerLoader } from "./PixelRunnerLoader";

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Sahyadri Campus Aerial Photograph Background (z-0) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero-bg.jpeg"
          alt="Sahyadri College Campus Aerial View"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02]"
        />

        {/* Liquid Glass Aqueous Surface Filter (Refractive fluid lens over campus image, NO flat white wash) */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(8px) saturate(160%) contrast(104%)",
            WebkitBackdropFilter: "blur(8px) saturate(160%) contrast(104%)",
            background:
              "radial-gradient(140% 100% at 10% 25%, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.12) 80%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(110deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.25) 55%, rgba(255, 255, 255, 0.1) 100%)",
          }}
        />

        {/* Fluid Liquid Caustics & Optical Light Waves */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 40%), radial-gradient(circle at 25% 85%, rgba(56, 189, 248, 0.3) 0%, transparent 45%)",
          }}
        />
      </div>

      {/* Scoped CSS for Thick Liquid Glass */}
      <style>{`
        .thick-liquid-glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.65) 0%,
            rgba(255, 255, 255, 0.28) 35%,
            rgba(255, 255, 255, 0.12) 65%,
            rgba(255, 255, 255, 0.45) 100%
          );
          backdrop-filter: blur(28px) saturate(200%) contrast(105%);
          -webkit-backdrop-filter: blur(28px) saturate(200%) contrast(105%);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow: 
            inset 0 2px 3px 0 rgba(255, 255, 255, 0.95),
            inset 0 -2px 3px 0 rgba(0, 0, 0, 0.08),
            inset 1.5px 0 2.5px 0 rgba(255, 255, 255, 0.6),
            inset -1.5px 0 2.5px 0 rgba(255, 255, 255, 0.4),
            0 24px 50px -12px rgba(17, 31, 58, 0.14),
            0 0 0 1px rgba(255, 255, 255, 0.4);
        }

        .thick-liquid-glass-inner {
          background: linear-gradient(
            135deg,
            rgba(248, 250, 252, 0.72) 0%,
            rgba(255, 255, 255, 0.45) 50%,
            rgba(241, 245, 249, 0.6) 100%
          );
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05);
        }

      `}</style>

      {/* Main Single-Desktop-Height Container (z-10) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-105px)] flex items-center py-8 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">

          {/* Left Column: Heading, Subtitle, Actions */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">

            {/* Headline */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-black tracking-tight leading-[1.12]"
              style={{ color: "#0f172a" }}
            >
              Academic Project Management,{" "}
              <span style={{ color: "#1e3a5f" }}>simplified.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-neutral-800 leading-relaxed max-w-xl font-medium">
              AcadeX coordinates the complete university capstone lifecycle from
              rule-based team formation and SDG-aligned proposals to milestone
              enforcement, code verification, and audit-ready academic compliance.
            </p>

            {/* Action Button */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1e3a5f]/25 transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <span>Access Your Dashboard</span>
                <IconArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Frame containing the Pixel Animated Loader (Thick Liquid Glass Slab) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[370px] xl:max-w-[400px]">

              {/* Thick Liquid Glass Outer Bezel Frame */}
              <div className="thick-liquid-glass relative rounded-3xl p-3 sm:p-3.5 transition-transform duration-300 hover:scale-[1.01]">

                {/* Thick Liquid Glass Inner Well */}
                <div className="thick-liquid-glass-inner relative w-full aspect-[4/3.8] rounded-2xl overflow-hidden flex items-center justify-center">
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

export default LandingHero;






// -------- old version bro(white shadow, no glass effect) dont touch this
// import Link from "next/link";
// import Image from "next/image";
// import { IconArrowRight } from "@/components/ui/Icon";
// import { PixelRunnerLoader } from "./PixelRunnerLoader";

// export function LandingHero() {
//   return (
//     <section className="relative w-full overflow-hidden bg-white">
//       {/* Sahyadri Campus Aerial Photograph Background (z-0, above bg-white) */}
//       <div className="absolute inset-0 pointer-events-none z-0">
//         <Image
//           src="/images/hero-bg.jpeg"
//           alt="Sahyadri College Campus Aerial View"
//           fill
//           priority
//           sizes="100vw"
//           className="object-cover object-center"
//         />
//         {/* Soft light gradient overlay for contrast while keeping the campus and river beautifully visible */}
//         <div className="absolute inset-0 bg-white/75 sm:bg-white/70 lg:bg-gradient-to-r lg:from-white/92 lg:via-white/80 lg:to-white/50" />
//       </div>

//       {/* Main Single-Desktop-Height Container (z-10, sits cleanly above the background) */}
//       <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-105px)] flex items-center py-8 lg:py-0">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">

//           {/* Left Column: Heading, Subtitle, Actions */}
//           <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
//             {/* Headline */}
//             <h1
//               className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-black tracking-tight leading-[1.12]"
//               style={{ color: "#111827" }}
//             >
//               Academic Project Management,{" "}
//               <span style={{ color: "#1e3a5f" }}>simplified.</span>
//             </h1>

//             {/* Subtitle */}
//             <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed max-w-xl font-medium">
//               AcadeX coordinates the complete university capstone lifecycle from
//               rule-based team formation and SDG-aligned proposals to milestone
//               enforcement, code verification, and audit-ready academic compliance.
//             </p>

//             {/* Action Button */}
//             <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start">
//               <Link
//                 href="/login"
//                 className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:opacity-95 hover:shadow-sm"
//                 style={{ backgroundColor: "#1e3a5f" }}
//               >
//                 <span>Access Your Dashboard</span>
//                 <IconArrowRight size={15} />
//               </Link>
//             </div>
//           </div>

//           {/* Right Column: Frame containing the Pixel Animated Loader (Light white shade, no shadow) */}
//           <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full">
//             <div className="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[370px] xl:max-w-[400px]">
//               {/* Card Container Frame */}
//               <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 bg-white/95 backdrop-blur-md p-2 sm:p-2.5">
//                 <div className="relative w-full aspect-[4/3.8] rounded-xl sm:rounded-2xl overflow-hidden bg-[#f8fafc]/90 border border-neutral-100 flex items-center justify-center">
//                   <PixelRunnerLoader />
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }
