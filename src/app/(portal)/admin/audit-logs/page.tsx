import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { AuditLogsClient } from "./AuditLogsClient";
import { adminNav } from "@/config/navigation";

export default async function AuditLogsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["admin"]); } catch { redirect("/login"); }
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  return (
    <Shell role="admin" navItems={adminNav} breadcrumbs={[{ label: "Admin", href: "/portal/admin" }, { label: "Audit Logs" }]} userFullName={profile?.full_name}>
      <PageWrapper title="Audit Logs" description="Immutable record of all platform actions.">
        <AuditLogsClient />
      </PageWrapper>
    </Shell>
  );
}

