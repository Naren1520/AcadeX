import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this also rotates the token if needed
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isProtectedPortal =
    pathname.startsWith("/student") ||
    pathname.startsWith("/faculty") ||
    pathname.startsWith("/admin");

  const isProtectedApi =
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/cron");

  if ((isProtectedPortal || isProtectedApi) && !session) {
    const loginUrl = new URL("/login", request.url);
    if (isProtectedPortal) {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
