import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { facultyNav } from "@/config/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { FacultyGuideClient } from "./FacultyGuideClient";

export const metadata = {
  title: "Faculty Guide - AcadeX",
  description:
    "Complete guide for faculty: login, managing sections, reviewing proposals, milestones, and submission windows.",
};

export default async function FacultyGuidePage() {
  const { fullName } = await requirePageRole(["faculty"]);

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[
        { label: "Faculty", href: "/faculty" },
        { label: "Guide" },
      ]}
      userFullName={fullName}
    >
      <PageWrapper
        title="Faculty Guide"
        description="Everything you need to know about using the AcadeX faculty portal."
      >
        <FacultyGuideClient />
      </PageWrapper>
    </Shell>
  );
}
