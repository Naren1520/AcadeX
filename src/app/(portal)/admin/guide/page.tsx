import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { adminNav } from "@/config/navigation";
import { requirePageRole } from "@/lib/supabase/pageAuth";
import { AdminGuideClient } from "./AdminGuideClient";

export const metadata = {
  title: "Admin Guide - AcadeX",
  description: "Complete guide for admins: departments, users, sections, faculty assignments, and audit logs.",
};

export default async function AdminGuidePage() {
  const { fullName } = await requirePageRole(["admin"]);

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Guide" }]}
      userFullName={fullName}
    >
      <PageWrapper
        title="Admin Guide"
        description="Everything you need to know about managing the AcadeX platform."
      >
        <AdminGuideClient />
      </PageWrapper>
    </Shell>
  );
}
