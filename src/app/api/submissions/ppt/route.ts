import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { uploadArtefact } from "@/server/storage";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";
import { isWindowOpen } from "@/lib/dates";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    const formData = await request.formData();
    const file = formData.get("file");
    const teamId = formData.get("team_id") as string;
    const milestoneId = formData.get("milestone_id") as string;
    const windowId = formData.get("window_id") as string;

    if (!(file instanceof File) || !teamId || !milestoneId || !windowId) {
      throw new ValidationError("file, team_id, milestone_id, and window_id are required.");
    }

    const { data: window } = await supabase
      .from("submission_windows")
      .select("opens_at, closes_at")
      .eq("id", windowId)
      .single();

    if (!window || !isWindowOpen(new Date(window.opens_at), new Date(window.closes_at))) {
      throw new ValidationError("Submission window is not currently open.", { window_id: "Window is closed." });
    }

    const storagePath = `submissions/${milestoneId}/${teamId}/ppt/${file.name}`;
    const { storagePath: savedPath } = await uploadArtefact({
      file,
      category: "ppt",
      path: storagePath,
      actorId: userId,
      actorRole: "student",
    });

    const { data: existing } = await supabase
      .from("submissions")
      .select("id, storage_path")
      .eq("team_id", teamId)
      .eq("milestone_id", milestoneId)
      .eq("window_id", windowId)
      .eq("artefact_type", "ppt")
      .maybeSingle();

    const isOverwrite = !!existing;

    const { data, error } = await supabase
      .from("submissions")
      .upsert({
        team_id: teamId,
        milestone_id: milestoneId,
        window_id: windowId,
        submitted_by: userId,
        artefact_type: "ppt",
        storage_path: savedPath,
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
      previousValue: isOverwrite ? { storage_path: existing?.storage_path } : undefined,
      newValue: { storage_path: savedPath },
    });

    return NextResponse.json({ submission: data }, { status: isOverwrite ? 200 : 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
