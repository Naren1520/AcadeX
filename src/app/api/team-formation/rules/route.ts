import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";
import { cgpaSchema } from "@/lib/validation";
import { validateRuleBands } from "@/server/workflows/teamFormationEngine";

const createRuleSchema = z.object({
  section_id: z.string().uuid(),
  cgpa_lower: cgpaSchema,
  cgpa_upper: cgpaSchema,
  min_team_size: z.number().int().min(1),
  max_team_size: z.number().int().min(1),
  max_teams: z.number().int().min(1),
}).refine((d) => d.cgpa_upper >= d.cgpa_lower, {
  message: "cgpa_upper must be >= cgpa_lower",
  path: ["cgpa_upper"],
}).refine((d) => d.max_team_size >= d.min_team_size, {
  message: "max_team_size must be >= min_team_size",
  path: ["max_team_size"],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "admin", "student"]);

    let query = supabase
      .from("team_formation_rules")
      .select("*")
      .eq("is_enabled", true)
      .order("created_at");
    if (sectionId) query = query.eq("section_id", sectionId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ rules: data });
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

    const parsed = createRuleSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const bandCheck = validateRuleBands(parsed.data.cgpa_lower, parsed.data.cgpa_upper);
    if (!bandCheck.valid) throw new ValidationError(bandCheck.error!, { cgpa_upper: bandCheck.error! });

    const { data, error } = await supabase
      .from("team_formation_rules")
      .insert({ ...parsed.data, faculty_id: userId })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
