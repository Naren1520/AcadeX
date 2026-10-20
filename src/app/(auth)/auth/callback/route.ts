import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const profile = profileData as { role: string } | null;
      const role = profile?.role;
      let redirectPath = "/student";
      if (role === "admin") redirectPath = "/admin";
      else if (role === "faculty") redirectPath = "/faculty";

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
