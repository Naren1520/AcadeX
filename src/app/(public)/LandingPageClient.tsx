"use client";

import { useState, useEffect } from "react";
import {
  LandingHeader,
  LandingHero,
  LandingStats,
  LandingWorkflow,
  LandingCapabilities,
  LandingGuidesBanner,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "@/components/landing";

export function LandingPageClient() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-200">
      <LandingHeader scrolled={scrolled} scrollProgress={scrollProgress} />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingWorkflow />
        <LandingCapabilities />
        <LandingGuidesBanner />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
