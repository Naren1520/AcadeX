import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";

export type Role = "admin" | "faculty" | "student";

interface PageAuthResult {
  userId: string;
  role: Role;
  fullName: string;
  email: string;
}

/**
 * Shared auth helper for all portal pages.
 * - Reads session from cookie (fast, no network call)
 * - Reads profile via service-role client (bypasses RLS)
 * - Redirects to /login if not authenticated
 * - Redirects to the correct dashboard if wrong role
 */
export async function requirePageRole(allowed: Role[]): Promise<PageAuthResult> {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const service = getSupabaseServiceRoleClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", session.user.id)
    .single() as { data: { role: string; full_name: string; email: string } | null };

  if (!profile) redirect("/login");

  const role = profile.role as Role;

  if (!allowed.includes(role)) {
    if (role === "admin") redirect("/admin");
    if (role === "faculty") redirect("/faculty");
    redirect("/student");
  }

  return {
    userId: session.user.id,
    role,
    fullName: profile.full_name,
    email: profile.email,
  };
}
