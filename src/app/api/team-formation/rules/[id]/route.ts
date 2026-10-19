import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { cgpaSchema } from "@/lib/validation";

const updateSchema = z.object({
  cgpa_lower: cgpaSchema.optional(),
  cgpa_upper: cgpaSchema.optional(),
  min_team_size: z.number().int().min(1).optional(),
  max_team_size: z.number().int().min(1).optional(),
  max_teams: z.number().int().min(1).optional(),
}).refine((d) => {
  if (d.cgpa_lower !== undefined && d.cgpa_upper !== undefined) {
    return d.cgpa_upper >= d.cgpa_lower;
  }
  return true;
}, { message: "cgpa_upper must be >= cgpa_lower", path: ["cgpa_upper"] });

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

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data, error } = await supabase
      .from("team_formation_rules")
      .update(parsed.data)
      .eq("id", id)
      .eq("faculty_id", userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Rule not found or you do not own it.");
    return NextResponse.json({ rule: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    // Soft-delete if teams exist, hard-delete otherwise
    const { count: teamCount } = await supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("rule_id", id);

    if ((teamCount ?? 0) > 0) {
      const { error } = await supabase
        .from("team_formation_rules")
        .update({ is_enabled: false })
        .eq("id", id)
        .eq("faculty_id", userId);
      if (error) throw error;
      return NextResponse.json({ success: true, soft: true });
    }

    const { error } = await supabase
      .from("team_formation_rules")
      .delete()
      .eq("id", id)
      .eq("faculty_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true, soft: false });
  } catch (err) {
    return toErrorResponse(err);
  }
}
