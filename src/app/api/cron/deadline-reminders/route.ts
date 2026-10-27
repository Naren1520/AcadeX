import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { sendInAppNotifications } from "@/server/notifications";
import { processEmailRetryQueue } from "@/server/notifications";

// Vercel Cron Job - runs every hour via vercel.json cron config
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServiceRoleClient();

  // Find milestones with deadline within 48 hours
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { data: upcomingMilestones } = await supabase
    .from("milestones")
    .select("id, name, deadline, proposal_id, faculty_id")
    .eq("status", "open")
    .gte("deadline", now.toISOString())
    .lte("deadline", in48h.toISOString());

  let notificationsSent = 0;

  for (const milestone of upcomingMilestones ?? []) {
    const { data: proposal } = await supabase
      .from("proposals")
      .select("team_id")
      .eq("id", milestone.proposal_id)
      .single();

    if (!proposal) continue;

    const { data: members } = await supabase
      .from("team_members")
      .select("student_id")
      .eq("team_id", proposal.team_id);

    const recipientIds = [
      ...(members ?? []).map((m) => m.student_id),
      milestone.faculty_id,
    ];

    if (recipientIds.length > 0) {
      await sendInAppNotifications({
        recipientIds,
        message: `Milestone "${milestone.name}" deadline is approaching: ${new Date(milestone.deadline).toLocaleString()}.`,
        deepLink: `/student/milestones`,
        triggerEvent: "milestone.deadline_approaching",
      });
      notificationsSent += recipientIds.length;
    }
  }

  // Process email retry queue
  await processEmailRetryQueue();

  return NextResponse.json({ ok: true, notificationsSent });
}
