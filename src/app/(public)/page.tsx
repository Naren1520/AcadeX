import type { Metadata } from "next";
import { LandingPageClient } from "./LandingPageClient";

export const metadata: Metadata = {
  title: "AcadeX",
  description:
    " academic project governance coordinating CGPA team formation, SDG-aligned proposal defenses, milestone reviews, GitHub artifact verification, and audit logs.",
  icons: {
    icon: "/images/sahyadrilogo1.png",
    shortcut: "/images/sahyadrilogo1.png",
    apple: "/images/sahyadrilogo1.png",
  },
};

export default function PublicHomePage() {
  return <LandingPageClient />;
}
