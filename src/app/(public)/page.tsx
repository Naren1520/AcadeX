import type { Metadata } from "next";
import { LandingPageClient } from "./LandingPageClient";

export const metadata: Metadata = {
  title: "AcadeX",
  description:
    "Enterprise academic project governance coordinating CGPA team formation, SDG-aligned proposal defenses, milestone reviews, GitHub artifact verification, and audit logs.",
};

export default function PublicHomePage() {
  return <LandingPageClient />;
}
