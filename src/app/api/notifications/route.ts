import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserWithRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await getAuthenticatedUserWithRole(supabase);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ notifications: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
