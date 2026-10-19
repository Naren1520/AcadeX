import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if token is near expiry
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedPortal = pathname.startsWith("/portal");
  const isProtectedApi =
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/cron");

  if ((isProtectedPortal || isProtectedApi) && !user) {
    const loginUrl = new URL("/login", request.url);
    if (isProtectedPortal) {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Admin portal requires MFA (AAL2)
  if (user && pathname.startsWith("/portal/admin")) {
    const { data: assuranceData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assuranceData && assuranceData.currentLevel !== "aal2") {
      const mfaUrl = new URL("/auth/mfa", request.url);
      return NextResponse.redirect(mfaUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
