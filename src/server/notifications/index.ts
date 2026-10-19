import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";

export type NotificationTrigger =
  | "proposal.approved"
  | "proposal.rejected"
  | "proposal.revision_requested"
  | "milestone.deadline_approaching"
  | "milestone.missed_deadline"
  | "submission_window.opened"
  | "submission_window.closed"
  | "team.membership_changed";

export interface NotificationPayload {
  recipientIds: string[];
  message: string;
  deepLink: string;
  triggerEvent: NotificationTrigger;
}

/**
 * Persists in-app notification records for all recipientIds.
 * Never throws — errors are captured in console.error.
 */
export async function sendInAppNotifications(
  payload: NotificationPayload
): Promise<void> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const rows = payload.recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      message: payload.message,
      deep_link: payload.deepLink,
      trigger_event: payload.triggerEvent,
      is_read: false,
    }));
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) {
      console.error("[Notifications] In-app INSERT failed:", error);
    }
  } catch (err) {
    console.error("[Notifications] Unexpected error in sendInAppNotifications:", err);
  }
}

/**
 * Sends email notifications via Resend.
 * On failure per recipient, queues for retry (exponential backoff: 30s, 60s, 120s).
 * Silently skips recipients with no email on record.
 * Never throws — errors are captured in console.error.
 */
export async function sendEmailNotifications(
  payload: NotificationPayload
): Promise<void> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", payload.recipientIds);

    if (!profiles || profiles.length === 0) return;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const profile of profiles) {
      if (!profile.email) continue;

      const subject = `AcadeX — ${payload.message.slice(0, 60)}`;
      const bodyHtml = `
        <p>Hello ${profile.full_name},</p>
        <p>${payload.message}</p>
        <p><a href="${payload.deepLink}">View in AcadeX</a></p>
      `;

      try {
        await resend.emails.send({
          from: "AcadeX <noreply@acadex.app>",
          to: profile.email,
          subject,
          html: bodyHtml,
        });
      } catch (err) {
        console.error(
          `[Notifications] Email delivery failed for ${profile.email}:`,
          err
        );
        // Queue for retry with exponential backoff
        const { error: queueError } = await supabase
          .from("email_retry_queue")
          .insert({
            recipient_id: profile.id,
            recipient_email: profile.email,
            subject,
            body_html: bodyHtml,
            trigger_event: payload.triggerEvent,
            attempt_count: 1,
            next_attempt_at: new Date(Date.now() + 30_000).toISOString(),
          });
        if (queueError) {
          console.error("[Notifications] Failed to queue email retry:", queueError);
        }
      }
    }
  } catch (err) {
    console.error("[Notifications] Unexpected error in sendEmailNotifications:", err);
  }
}

/**
 * Processes pending email retries up to attempt 4, then marks exhausted.
 * Retry schedule: attempt 2 → +30s, attempt 3 → +60s, attempt 4 → +120s.
 */
export async function processEmailRetryQueue(): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { data: pending } = await supabase
    .from("email_retry_queue")
    .select("*")
    .eq("exhausted", false)
    .lte("next_attempt_at", new Date().toISOString())
    .limit(50);

  if (!pending || pending.length === 0) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const item of pending) {
    const newAttemptCount = item.attempt_count + 1;

    try {
      await resend.emails.send({
        from: "AcadeX <noreply@acadex.app>",
        to: item.recipient_email,
        subject: item.subject,
        html: item.body_html,
      });
      // Success — remove from queue
      await supabase.from("email_retry_queue").delete().eq("id", item.id);
    } catch {
      if (newAttemptCount >= 4) {
        // Exhausted all retries
        await supabase
          .from("email_retry_queue")
          .update({ exhausted: true, attempt_count: newAttemptCount })
          .eq("id", item.id);

        // Log failure to audit log
        if (item.recipient_id) {
          await writeAuditLog({
            actorId: item.recipient_id,
            actorRole: "system",
            actionType: AuditEventTypes.NOTIFICATION_EMAIL_FAILED,
            targetTable: "email_retry_queue",
            targetRecordId: item.id,
            newValue: {
              recipientEmail: item.recipient_email,
              triggerEvent: item.trigger_event,
              attemptCount: newAttemptCount,
            },
          });
        }
      } else {
        // Backoff delays: attempt 2→30s, 3→60s, 4→120s
        const delayMs = [30_000, 60_000, 120_000][newAttemptCount - 2] ?? 120_000;
        await supabase
          .from("email_retry_queue")
          .update({
            attempt_count: newAttemptCount,
            next_attempt_at: new Date(Date.now() + delayMs).toISOString(),
          })
          .eq("id", item.id);
      }
    }
  }
}
