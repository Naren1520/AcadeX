import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { Role } from "@/server/authorization";

export const AuditEventTypes = {
  // Auth
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  // User management
  USER_CREATED: "user.created",
  USER_EDITED: "user.edited",
  USER_DELETED: "user.deleted",
  USER_PASSWORD_CHANGED: "user.password_changed",
  // Department / academic structure
  DEPARTMENT_CREATED: "department.created",
  DEPARTMENT_UPDATED: "department.updated",
  DEPARTMENT_DEACTIVATED: "department.deactivated",
  ACADEMIC_YEAR_CREATED: "academic_year.created",
  ACADEMIC_YEAR_CLOSED: "academic_year.closed",
  SEMESTER_CREATED: "semester.created",
  SEMESTER_CLOSED: "semester.closed",
  SECTION_CREATED: "section.created",
  FACULTY_ASSIGNED: "faculty.assigned",
  FACULTY_UNASSIGNED: "faculty.unassigned",
  STUDENT_SECTION_ASSIGNED: "student.section_assigned",
  // CGPA
  CGPA_UPDATED: "cgpa.updated",
  // Teams
  TEAM_FORMED: "team.formed",
  TEAM_MEMBER_ADDED: "team.member_added",
  TEAM_MEMBER_REMOVED: "team.member_removed",
  // Proposals
  PROPOSAL_SUBMITTED: "proposal.submitted",
  PROPOSAL_APPROVED: "proposal.approved",
  PROPOSAL_REJECTED: "proposal.rejected",
  PROPOSAL_REVISION_REQUESTED: "proposal.revision_requested",
  // Milestones
  MILESTONE_CREATED: "milestone.created",
  MILESTONE_DEADLINE_UPDATED: "milestone.deadline_updated",
  // Submissions
  SUBMISSION_UPLOADED: "submission.uploaded",
  SUBMISSION_OVERWRITTEN: "submission.overwritten",
  // Files
  FILE_UPLOADED: "file.uploaded",
  FILE_ACCESSED: "file.accessed",
  // Notifications
  NOTIFICATION_EMAIL_FAILED: "notification.email_failed",
} as const;

export type AuditEventType =
  (typeof AuditEventTypes)[keyof typeof AuditEventTypes];

export interface AuditEntry {
  actorId: string;
  actorRole: Role | "system";
  actorEmail?: string;
  actionType: AuditEventType;
  targetTable: string;
  targetRecordId: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Writes an audit log entry using the service-role client (bypasses RLS).
 * Never throws - errors are captured in console.error.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getSupabaseServiceRoleClient();

    // Auto-fetch actor email if not provided
    let actorEmail = entry.actorEmail;
    if (!actorEmail && entry.actorId && entry.actorRole !== "system") {
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", entry.actorId)
        .single();
      actorEmail = data?.email ?? undefined;
    }

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: entry.actorId,
      actor_role: entry.actorRole,
      actor_email: actorEmail ?? null,
      action_type: entry.actionType,
      target_table: entry.targetTable,
      target_record_id: entry.targetRecordId,
      previous_value: entry.previousValue ?? null,
      new_value: entry.newValue ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
    });

    if (error) console.error("[AuditLog] INSERT failed:", { error, actorId: entry.actorId, actionType: entry.actionType });
  } catch (err) {
    console.error("[AuditLog] Unexpected error:", { err, actorId: entry.actorId, actionType: entry.actionType });
  }
}

/** Helper to extract IP + User-Agent from a Next.js Request */
export function extractRequestMeta(request: Request): { ipAddress?: string; userAgent?: string } {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;
  return { ipAddress, userAgent };
}
