/**
 * POST   /api/faculty/teams/[teamId]/mentor  - assign a mentor
 * DELETE /api/faculty/teams/[teamId]/mentor  - remove the mentor
 * GET    /api/faculty/teams/[teamId]/mentor  - get current mentor
 *
 * Only the faculty who owns the section the team belongs to can assign mentors.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";

async function verifyTeamOwnership(facultyId: string, teamId: string) {
  const service = getSupabaseServiceRoleClient();
  const { data: team } = await service
    .from("teams").select("id, section_id").eq("id", teamId).single();
  if (!team) throw new NotFoundError("Team not found.");

  const { data: assignment } = await service
    .from("faculty_assignments")
    .select("id").eq("faculty_id", facultyId).eq("section_id", team.section_id).single();
  if (!assignment) throw new ForbiddenError("You are not assigned to this team's section.");
  return team;
}

// ── GET ───────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "admin"]);

    const service = getSupabaseServiceRoleClient();
    const { data, error } = await service
      .from("team_mentors")
      .select("id, mentor_id, notes, assigned_at, profiles!team_mentors_mentor_id_fkey(full_name, email)")
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ mentor: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ── POST - assign ─────────────────────────────────────────────
const assignSchema = z.object({
  mentor_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    await verifyTeamOwnership(userId, teamId);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const service = getSupabaseServiceRoleClient();

    // Verify mentor is a faculty member
    const { data: mentorProfile } = await service
      .from("profiles").select("id, role, full_name").eq("id", parsed.data.mentor_id).single();
    if (!mentorProfile || mentorProfile.role !== "faculty") {
      throw new ValidationError("Mentor must be a faculty member.", { mentor_id: "Must be a faculty user." });
    }

    // Upsert - one mentor per team
    const { data, error } = await service
      .from("team_mentors")
      .upsert({ team_id: teamId, mentor_id: parsed.data.mentor_id, assigned_by: userId, notes: parsed.data.notes ?? null },
        { onConflict: "team_id,mentor_id" })
      .select("id, mentor_id, notes, assigned_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ mentor: { ...data, full_name: mentorProfile.full_name } }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ── DELETE - remove ───────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    await verifyTeamOwnership(userId, teamId);

    const service = getSupabaseServiceRoleClient();
    const { error } = await service.from("team_mentors").delete().eq("team_id", teamId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
