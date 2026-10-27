import type { Metadata } from "next";
import {
  AboutHeader,
  AboutHero,
  AboutMentor,
  AboutTeam,
  AboutPlatformDetails,
  AboutFooter,
} from "@/components/about";

export const metadata: Metadata = {
  title: "About Platform — AcadeX",
  description:
    "AcadeX Academic Mini Project engineered by 5th Semester ISE (Section B) students at Sahyadri College of Engineering & Management, mentored by Dr. Rithesh Pakkala, HoD ISE Dept.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-200">
      <AboutHeader />
      <main>
        <AboutHero />
        <AboutMentor />
        <AboutTeam />
        <AboutPlatformDetails />
      </main>
      <AboutFooter />
    </div>
  );
}
