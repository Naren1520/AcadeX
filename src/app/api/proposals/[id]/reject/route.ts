import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications, sendEmailNotifications } from "@/server/notifications";
import { applyProposalTransition } from "@/server/workflows/proposalStateMachine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

const schema = z.object({
  rejection_reason: z.string().min(10, "Rejection reason must be at least 10 characters."),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data: proposal } = await supabase
      .from("proposals")
      .select("status, team_id, title, faculty_id")
      .eq("id", id)
      .single();

    if (!proposal) throw new NotFoundError("Proposal not found.");

    const transition = applyProposalTransition(
      proposal.status as "pending" | "approved" | "rejected" | "revision_requested",
      "rejected"
    );
    if (!transition.success) throw new ValidationError(transition.error!);

    const { data: updated, error } = await supabase
      .from("proposals")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.rejection_reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("faculty_id", userId)
      .select()
      .single();

    if (error || !updated) throw new NotFoundError("Proposal not found or you are not the supervisor.");

    writeAuditLog({
      actorId: userId,
      actorRole: "faculty",
      actionType: AuditEventTypes.PROPOSAL_REJECTED,
      targetTable: "proposals",
      targetRecordId: id,
      previousValue: { status: proposal.status },
      newValue: { status: "rejected", rejection_reason: parsed.data.rejection_reason },
    });

    const { data: members } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", proposal.team_id);

    const recipientIds = (members ?? []).map((m) => m.student_id);
    const notifPayload = {
      recipientIds,
      message: `Your proposal "${proposal.title}" has been rejected. Reason: ${parsed.data.rejection_reason}`,
      deepLink: `/portal/student/proposals/${id}`,
      triggerEvent: "proposal.rejected" as const,
    };
    sendInAppNotifications(notifPayload).catch(console.error);
    sendEmailNotifications(notifPayload).catch(console.error);

    return NextResponse.json({ proposal: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
