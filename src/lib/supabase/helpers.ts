import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SupabaseServerClient = SupabaseClient<Database>;

/**
 * Fetches a user's profile row and returns typed fields.
 * Avoids the `never` TypeScript inference that occurs with narrow `.select()` calls.
 */
export async function getUserProfile(
  supabase: SupabaseServerClient,
  userId: string
): Promise<{ full_name: string; email: string; role: string } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", userId)
    .single();
  return data as { full_name: string; email: string; role: string } | null;
}
