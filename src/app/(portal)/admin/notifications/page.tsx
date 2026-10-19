import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { redirect } from "next/navigation";
import { NotificationsClient } from "@/features/notifications/components/NotificationsClient";
import { adminNav } from "@/config/navigation";

export default async function AdminNotificationsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["admin"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <Shell
      role="admin"
      navItems={adminNav}
      breadcrumbs={[{ label: "Admin", href: "/portal/admin" }, { label: "Notifications" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Notifications">
        <NotificationsClient initialNotifications={notifications ?? []} />
      </PageWrapper>
    </Shell>
  );
}

