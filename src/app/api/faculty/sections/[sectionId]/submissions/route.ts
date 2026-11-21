import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    // Verify this faculty is assigned to the section
    const { data: assignment } = await supabase
      .from("faculty_assignments")
      .select("id")
      .eq("faculty_id", userId)
      .eq("section_id", sectionId)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: "Not authorised." }, { status: 403 });
    }

    // Get all teams in this section
    const { data: teams } = await supabase
      .from("teams")
      .select("id")
      .eq("section_id", sectionId);

    const teamIds = (teams ?? []).map((t) => t.id);
    if (teamIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("id, artefact_type, status, submitted_at, storage_path, github_url, milestone_id, team_id, teams(name), milestones(name)")
      .in("team_id", teamIds)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: submissions ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}
