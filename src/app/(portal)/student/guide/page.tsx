import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { studentNav } from "@/config/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { StudentGuideClient } from "./StudentGuideClient";

export const metadata = {
  title: "Student Guide - AcadeX",
  description:
    "Complete guide for students: login, team formation, proposals, milestones, and submissions.",
};

export default async function StudentGuidePage() {
  const { fullName } = await requirePageRole(["student"]);

  return (
    <Shell
      role="student"
      navItems={studentNav}
      breadcrumbs={[
        { label: "Student", href: "/student" },
        { label: "Guide" },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title="Student Guide"
        description="Everything you need to know about using the AcadeX student portal."
      >
        <StudentGuideClient />
      </PageWrapper>
    </Shell>
  );
}
