import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { Role } from "@/server/authorization";

export const AuditEventTypes = {
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  CGPA_UPDATED: "cgpa.updated",
  PROPOSAL_SUBMITTED: "proposal.submitted",
  PROPOSAL_APPROVED: "proposal.approved",
  PROPOSAL_REJECTED: "proposal.rejected",
  PROPOSAL_REVISION_REQUESTED: "proposal.revision_requested",
  SUBMISSION_UPLOADED: "submission.uploaded",
  SUBMISSION_OVERWRITTEN: "submission.overwritten",
  TEAM_FORMED: "team.formed",
  TEAM_MEMBER_ADDED: "team.member_added",
  TEAM_MEMBER_REMOVED: "team.member_removed",
  MILESTONE_CREATED: "milestone.created",
  MILESTONE_DEADLINE_UPDATED: "milestone.deadline_updated",
  FILE_UPLOADED: "file.uploaded",
  FILE_ACCESSED: "file.accessed",
  NOTIFICATION_EMAIL_FAILED: "notification.email_failed",
} as const;

export type AuditEventType =
  (typeof AuditEventTypes)[keyof typeof AuditEventTypes];

export interface AuditEntry {
  actorId: string;
  actorRole: Role | "system";
  actionType: AuditEventType;
  targetTable: string;
  targetRecordId: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

/**
 * Writes an audit log entry using the service-role client (bypasses RLS).
 * On any failure, captures the error in application error logging — never throws.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: entry.actorId,
      actor_role: entry.actorRole,
      action_type: entry.actionType,
      target_table: entry.targetTable,
      target_record_id: entry.targetRecordId,
      previous_value: entry.previousValue ?? null,
      new_value: entry.newValue ?? null,
    });

    if (error) {
      console.error("[AuditLog] INSERT failed:", {
        error,
        actorId: entry.actorId,
        actionType: entry.actionType,
        targetRecordId: entry.targetRecordId,
      });
    }
  } catch (err) {
    console.error("[AuditLog] Unexpected error writing audit log:", {
      err,
      actorId: entry.actorId,
      actionType: entry.actionType,
      targetRecordId: entry.targetRecordId,
    });
  }
}
