import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");
    const status    = searchParams.get("status") ?? "pending";

    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const service = getSupabaseServiceRoleClient();

    let query = service
      .from("onboarding_submissions")
      .select("*, onboarding_invitations!inner(section_id, faculty_id, label)")
      .eq("onboarding_invitations.faculty_id", userId)
      .order("submitted_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);
    if (sectionId) query = query.eq("onboarding_invitations.section_id", sectionId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ submissions: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
