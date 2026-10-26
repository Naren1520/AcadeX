import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a singleton Supabase browser client.
 * The `any` generic avoids Row→never inference collapse in strict mode.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseBrowserClient(): ReturnType<typeof createBrowserClient<any>> {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return client;
}
