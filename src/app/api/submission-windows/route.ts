import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { sendInAppNotifications } from "@/server/notifications";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";

const createSchema = z.object({
  milestone_id: z.string().uuid(),
  opens_at: z.string().datetime(),
  closes_at: z.string().datetime(),
}).refine((d) => new Date(d.closes_at) > new Date(d.opens_at), {
  message: "closes_at must be after opens_at",
  path: ["closes_at"],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "student", "admin"]);

    let query = supabase
      .from("submission_windows")
      .select("*")
      .order("opens_at", { ascending: false });
    if (milestoneId) query = query.eq("milestone_id", milestoneId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ windows: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data, error } = await supabase
      .from("submission_windows")
      .insert({ ...parsed.data, faculty_id: userId })
      .select()
      .single();

    if (error) throw error;

    // Notify teams via milestone → proposal → team members
    const { data: milestone } = await supabase
      .from("milestones")
      .select("proposal_id, name")
      .eq("id", parsed.data.milestone_id)
      .single();

    if (milestone) {
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("student_id")
        .eq("team_id",
          (await supabase.from("proposals").select("team_id").eq("id", milestone.proposal_id).single()).data?.team_id ?? ""
        );

      const recipientIds = (teamMembers ?? []).map((m) => m.student_id);
      if (recipientIds.length > 0) {
        sendInAppNotifications({
          recipientIds,
          message: `A submission window for milestone "${milestone.name}" is now open.`,
          deepLink: `/portal/student/submissions`,
          triggerEvent: "submission_window.opened",
        }).catch(console.error);
      }
    }

    return NextResponse.json({ window: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
