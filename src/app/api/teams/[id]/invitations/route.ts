/**
 * POST /api/teams/[id]/invitations
 * Team leader invites a student to their team.
 *
 * GET /api/teams/[id]/invitations
 * List pending invitations for a team (leader only).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, ValidationError, ConflictError, NotFoundError } from "@/lib/errors";
import { sendInAppNotifications } from "@/server/notifications";
import { findMatchingSlot } from "@/server/workflows/teamFormationEngine";

const inviteSchema = z.object({ invitee_id: z.string().uuid() });

// ── GET ──
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    // Verify caller is team lead
    const { data: membership } = await supabase
      .from("team_members").select("is_lead").eq("team_id", teamId).eq("student_id", userId).single();
    if (!membership?.is_lead) throw new ForbiddenError("Only the team leader can view invitations.");

    const { data, error } = await supabase
      .from("team_invitations")
      .select("id, status, created_at, invitee_id, profiles!team_invitations_invitee_id_fkey(full_name, email)")
      .eq("team_id", teamId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ invitations: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ── POST ─
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    // Verify caller is team lead of this team
    const { data: membership } = await supabase
      .from("team_members").select("is_lead").eq("team_id", teamId).eq("student_id", userId).single();
    if (!membership?.is_lead) throw new ForbiddenError("Only the team leader can invite members.");

    // Check team is still forming
    const { data: team } = await supabase
      .from("teams")
      .select("id, status, section_id, rule_id, team_formation_rules(*, team_formation_slots(*))")
      .eq("id", teamId).single();

    if (!team) throw new NotFoundError("Team not found.");
    if (team.status !== "forming") throw new ConflictError(`Cannot invite to a team that is ${team.status}.`);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const { invitee_id } = parsed.data;
    const service = getSupabaseServiceRoleClient();

    // Verify invitee is a student in the same section and not already in a team
    const { data: inviteeStudent } = await service
      .from("students").select("id, cgpa, section_id").eq("id", invitee_id).single();

    if (!inviteeStudent) throw new ValidationError("Student not found.", { invitee_id: "Must be a valid student." });
    if (inviteeStudent.section_id !== team.section_id) throw new ValidationError("Student is not in the same section.", { invitee_id: "Different section." });

    const { data: existingMember } = await service
      .from("team_members").select("id").eq("student_id", invitee_id).maybeSingle();
    if (existingMember) throw new ConflictError("This student is already in a team.", "invitee_id");

    // Check CGPA eligibility against rule slots
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rule = (team as any).team_formation_rules as { team_formation_slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[]; cgpa_lower?: number; cgpa_upper?: number } | null;
    if (rule?.team_formation_slots?.length) {
      const match = findMatchingSlot(inviteeStudent.cgpa, rule.team_formation_slots);
      if (!match) {
        throw new ValidationError(
          `Student CGPA (${inviteeStudent.cgpa}) does not fit any slot in this team's rule.`,
          { invitee_id: "CGPA ineligible for this team." }
        );
      }
    }

    // Check for existing pending invite
    const { data: existing } = await service
      .from("team_invitations").select("id, status").eq("team_id", teamId).eq("invitee_id", invitee_id).maybeSingle();
    if (existing?.status === "pending") throw new ConflictError("An invitation is already pending for this student.", "invitee_id");

    // Create invitation
    const { data: inv, error: invError } = await supabase
      .from("team_invitations")
      .insert({ team_id: teamId, inviter_id: userId, invitee_id })
      .select("id")
      .single();
    if (invError) throw invError;

    // Notify invitee
    const { data: inviterProfile } = await service.from("profiles").select("full_name").eq("id", userId).single();
    sendInAppNotifications({
      recipientIds: [invitee_id],
      message: `${inviterProfile?.full_name ?? "A team leader"} has invited you to join their team.`,
      deepLink: "/student/teams",
      triggerEvent: "team.membership_changed",
    }).catch(console.error);

    return NextResponse.json({ invitation: { id: inv.id } }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
