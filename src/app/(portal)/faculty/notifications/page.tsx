import { requirePageRole } from "@/lib/supabase/pageAuth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { NotificationsClient } from "@/features/notifications/components/NotificationsClient";
import { facultyNav } from "@/config/navigation";

export default async function FacultyNotificationsPage() {
  const { userId, fullName } = await requirePageRole(["faculty"]);
  const supabase = await getSupabaseServerClient();

  const { data: notifications } = await supabase
    .from("notifications").select("*").eq("recipient_id", userId).order("created_at", { ascending: false });

  return (
    <Shell role="faculty" navItems={facultyNav} breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Notifications" }]} userFullName={fullName}>
      <PageWrapper title="Notifications">
        <NotificationsClient initialNotifications={notifications ?? []} />
      </PageWrapper>
    </Shell>
  );
}
