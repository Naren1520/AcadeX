import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";

/**
 * Role router — reads the session server-side, looks up the user's role
 * via service-role client (bypasses RLS), and redirects to the correct dashboard.
 */
export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const service = getSupabaseServiceRoleClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single() as { data: { role: string } | null };

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "faculty") redirect("/faculty");
  redirect("/student");
}
