/**
 * PATCH /api/teams/[id]/invitations/[invitationId]
 * Invitee accepts or declines an invitation.
 * On accept - joinTeam() engine runs (CGPA/slot checks apply).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { joinTeam } from "@/server/workflows/teamFormationEngine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, NotFoundError, ConflictError, ValidationError } from "@/lib/errors";

const respondSchema = z.object({ action: z.enum(["accept", "decline"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id: teamId, invitationId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    const { data: inv } = await supabase
      .from("team_invitations")
      .select("id, invitee_id, status, team_id")
      .eq("id", invitationId)
      .eq("team_id", teamId)
      .single();

    if (!inv) throw new NotFoundError("Invitation not found.");
    if (inv.invitee_id !== userId) throw new ForbiddenError("This invitation is not for you.");
    if (inv.status !== "pending") throw new ConflictError(`Invitation already ${inv.status}.`);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const { action } = parsed.data;

    if (action === "decline") {
      await supabase
        .from("team_invitations")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", invitationId);
      return NextResponse.json({ success: true, status: "declined" });
    }

    // Accept - get section_id from team first
    const { data: team } = await supabase
      .from("teams").select("section_id").eq("id", teamId).single();
    if (!team) throw new NotFoundError("Team not found.");

    // Run engine (validates CGPA slots, capacity, quota)
    await joinTeam({ studentId: userId, teamId, sectionId: team.section_id });

    // Mark invitation accepted
    await supabase
      .from("team_invitations")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    return NextResponse.json({ success: true, status: "accepted" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
