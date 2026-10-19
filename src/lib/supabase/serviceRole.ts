import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase service-role client (bypasses RLS).
 * Use only in server-side trusted code (audit logs, admin workflows, storage).
 *
 * The `any` generic avoids the Row→never collapse that occurs with
 * @supabase/supabase-js@2.118 + complex Database generics in strict mode.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serviceClient: ReturnType<typeof createClient<any>> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseServiceRoleClient(): ReturnType<typeof createClient<any>> {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return serviceClient;
}
