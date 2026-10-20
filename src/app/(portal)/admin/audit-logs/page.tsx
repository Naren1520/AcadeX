import { requirePageRole } from "@/lib/supabase/pageAuth";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AuditLogsClient } from "./AuditLogsClient";
import { adminNav } from "@/config/navigation";

export default async function AuditLogsPage() {
  const { fullName } = await requirePageRole(["admin"]);

  return (
    <Shell role="admin" navItems={adminNav} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit Logs" }]} userFullName={fullName}>
      <PageWrapper title="Audit Logs" description="Immutable record of all platform actions.">
        <AuditLogsClient />
      </PageWrapper>
    </Shell>
  );
}
