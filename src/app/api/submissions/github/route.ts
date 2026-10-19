import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";
import { githubRepoSchema } from "@/lib/validation";
import { isWindowOpen } from "@/lib/dates";

const submitSchema = z.object({
  team_id: z.string().uuid(),
  milestone_id: z.string().uuid(),
  window_id: z.string().uuid(),
  github_url: githubRepoSchema,
});

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    // Verify window is open
    const { data: window } = await supabase
      .from("submission_windows")
      .select("opens_at, closes_at")
      .eq("id", parsed.data.window_id)
      .single();

    if (!window || !isWindowOpen(new Date(window.opens_at), new Date(window.closes_at))) {
      throw new ValidationError("Submission window is not currently open.", { window_id: "Window is closed." });
    }

    // Check for existing submission (upsert)
    const { data: existing } = await supabase
      .from("submissions")
      .select("id, github_url")
      .eq("team_id", parsed.data.team_id)
      .eq("milestone_id", parsed.data.milestone_id)
      .eq("window_id", parsed.data.window_id)
      .eq("artefact_type", "github_link")
      .maybeSingle();

    const isOverwrite = !!existing;

    const { data, error } = await supabase
      .from("submissions")
      .upsert({
        team_id: parsed.data.team_id,
        milestone_id: parsed.data.milestone_id,
        window_id: parsed.data.window_id,
        submitted_by: userId,
        artefact_type: "github_link",
        github_url: parsed.data.github_url,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      }, { onConflict: "team_id,milestone_id,window_id,artefact_type" })
      .select()
      .single();

    if (error) throw error;

    writeAuditLog({
      actorId: userId,
      actorRole: "student",
      actionType: isOverwrite ? AuditEventTypes.SUBMISSION_OVERWRITTEN : AuditEventTypes.SUBMISSION_UPLOADED,
      targetTable: "submissions",
      targetRecordId: data.id,
      previousValue: isOverwrite ? { github_url: existing?.github_url } : undefined,
      newValue: { github_url: parsed.data.github_url },
    });

    return NextResponse.json({ submission: data }, { status: isOverwrite ? 200 : 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
