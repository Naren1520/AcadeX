import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications } from "@/server/notifications";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError } from "@/lib/errors";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id: teamId, studentId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId, role } = await requireRole(supabase, ["faculty", "admin"]);

    const { data: member } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("student_id", studentId)
      .single();

    if (!member) throw new NotFoundError("Team member not found.");

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("student_id", studentId);

    if (error) throw error;

    writeAuditLog({
      actorId: userId,
      actorRole: role,
      actionType: AuditEventTypes.TEAM_MEMBER_REMOVED,
      targetTable: "team_members",
      targetRecordId: teamId,
      newValue: { removedStudentId: studentId },
    });

    sendInAppNotifications({
      recipientIds: [studentId],
      message: "You have been removed from your team.",
      deepLink: `/student/teams`,
      triggerEvent: "team.membership_changed",
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
