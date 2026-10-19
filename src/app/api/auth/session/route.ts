import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ userId: null, role: null }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  const profile = profileRaw as { role: string } | null;

  return NextResponse.json({ userId: user.id, role: profile?.role ?? null });
}
