import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { generateSignedUrl } from "@/server/storage";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student", "faculty", "admin"]);

    const { data: submission } = await supabase
      .from("submissions")
      .select("id, storage_path, artefact_type, team_id")
      .eq("id", id)
      .single();

    if (!submission?.storage_path) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    // Students can only view their own team's submissions
    const { data: member } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", submission.team_id)
      .eq("student_id", userId)
      .maybeSingle();

    // Faculty and admin can view without membership check — handled by role above
    // Students must be a team member
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single() as { data: { role: string } | null };

    if (profile?.role === "student" && !member) {
      return NextResponse.json({ error: "Not authorised." }, { status: 403 });
    }

    const url = await generateSignedUrl(
      submission.storage_path,
      userId,
      profile?.role as "student" | "faculty" | "admin" ?? "student",
      300
    );

    return NextResponse.json({ url });
  } catch (err) {
    return toErrorResponse(err);
  }
}
