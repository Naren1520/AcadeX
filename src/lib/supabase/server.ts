import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Returns a Supabase server client.
 *
 * Note: We intentionally omit the Database generic here because
 * @supabase/ssr@0.12.x + @supabase/supabase-js@2.118 collapses Row
 * inference to `never` for complex generics in strict mode.
 * All query results are cast explicitly at call sites instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSupabaseServerClient(): Promise<ReturnType<typeof createServerClient<any>>> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies — expected behaviour.
          }
        },
      },
    }
  );
}
