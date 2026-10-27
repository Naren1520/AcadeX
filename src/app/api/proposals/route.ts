import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications, sendEmailNotifications } from "@/server/notifications";
import { checkSingleActiveProposal } from "@/server/workflows/proposalStateMachine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";
import { sdgNumberSchema } from "@/lib/validation";

const createProposalSchema = z.object({
  team_id: z.string().uuid(),
  faculty_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  sdg_numbers: z.array(sdgNumberSchema).min(1, "At least one SDG must be selected.").max(17),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["student", "faculty", "admin"]);

    let query = supabase
      .from("proposals")
      .select("*, proposal_sdgs(sdg_number)")
      .order("submitted_at", { ascending: false });
    if (teamId) query = query.eq("team_id", teamId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ proposals: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createProposalSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    // Verify team is confirmed
    const { data: team } = await supabase
      .from("teams")
      .select("status, section_id")
      .eq("id", parsed.data.team_id)
      .single();

    if (!team || team.status !== "confirmed") {
      throw new ValidationError("Team must be confirmed before submitting a proposal.", { team_id: "Team is not yet confirmed." });
    }

    // Enforce single active proposal
    const activeCount = await checkSingleActiveProposal(parsed.data.team_id, supabase);
    if (activeCount > 0) {
      throw new ConflictError("This team already has an active (pending or revision-requested) proposal.");
    }

    // Insert proposal
    const { data: proposal, error: propError } = await supabase
      .from("proposals")
      .insert({
        team_id: parsed.data.team_id,
        faculty_id: parsed.data.faculty_id,
        title: parsed.data.title,
        description: parsed.data.description,
        status: "pending",
        version: 1,
      })
      .select()
      .single();

    if (propError) {
      console.error("[Proposals] Proposal insert failed:", JSON.stringify(propError));
      throw propError;
    }
    if (!proposal) throw new Error("Failed to create proposal - no data returned.");

    // Insert SDG associations
    const { error: sdgError } = await supabase.from("proposal_sdgs").insert(
      parsed.data.sdg_numbers.map((n) => ({ proposal_id: proposal.id, sdg_number: n }))
    );
    if (sdgError) {
      // Roll back proposal if SDGs fail
      await supabase.from("proposals").delete().eq("id", proposal.id);
      console.error("[Proposals] SDG insert failed:", sdgError);
      throw sdgError;
    }

    writeAuditLog({
      actorId: userId,
      actorRole: "student",
      actionType: AuditEventTypes.PROPOSAL_SUBMITTED,
      targetTable: "proposals",
      targetRecordId: proposal.id,
      newValue: { title: proposal.title, teamId: proposal.team_id },
    });

    // Notify team members
    const { data: members } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", parsed.data.team_id);

    const recipientIds = (members ?? []).map((m) => m.student_id);
    sendInAppNotifications({
      recipientIds,
      message: `Your proposal "${parsed.data.title}" has been submitted and is pending review.`,
      deepLink: `/student/proposals/${proposal.id}`,
      triggerEvent: "proposal.approved",
    }).catch(console.error);

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
