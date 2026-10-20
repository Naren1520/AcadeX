import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications, sendEmailNotifications } from "@/server/notifications";
import { applyProposalTransition } from "@/server/workflows/proposalStateMachine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const { data: proposal } = await supabase
      .from("proposals")
      .select("status, team_id, title, faculty_id")
      .eq("id", id)
      .single();

    if (!proposal) throw new NotFoundError("Proposal not found.");

    const transition = applyProposalTransition(
      proposal.status as "pending" | "approved" | "rejected" | "revision_requested",
      "approved"
    );
    if (!transition.success) throw new ValidationError(transition.error!);

    const { data: updated, error } = await supabase
      .from("proposals")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("faculty_id", userId)
      .select()
      .single();

    if (error || !updated) throw new NotFoundError("Proposal not found or you are not the supervisor.");

    writeAuditLog({
      actorId: userId,
      actorRole: "faculty",
      actionType: AuditEventTypes.PROPOSAL_APPROVED,
      targetTable: "proposals",
      targetRecordId: id,
      previousValue: { status: proposal.status },
      newValue: { status: "approved" },
    });

    const { data: members } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", proposal.team_id);

    const recipientIds = (members ?? []).map((m) => m.student_id);
    const notifPayload = {
      recipientIds,
      message: `Your proposal "${proposal.title}" has been approved.`,
      deepLink: `/student/proposals/${id}`,
      triggerEvent: "proposal.approved" as const,
    };
    sendInAppNotifications(notifPayload).catch(console.error);
    sendEmailNotifications(notifPayload).catch(console.error);

    return NextResponse.json({ proposal: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
