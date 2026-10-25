/**
 * GET /api/students/invitations
 * Returns pending team invitations for the logged-in student.
 */
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    const { data, error } = await supabase
      .from("team_invitations")
      .select(`
        id, status, created_at, team_id,
        teams(id, name, status, section_id),
        profiles!team_invitations_inviter_id_fkey(full_name, email)
      `)
      .eq("invitee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ invitations: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
