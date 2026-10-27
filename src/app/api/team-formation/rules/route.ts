import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";

const slotSchema = z.object({
  cgpa_lower: z.number().min(0).max(10),
  cgpa_upper: z.number().min(0).max(10),
  count: z.number().int().min(1),
  label: z.string().max(100).default(""),
}).refine((s) => s.cgpa_upper >= s.cgpa_lower, {
  message: "cgpa_upper must be >= cgpa_lower", path: ["cgpa_upper"],
});

const createRuleSchema = z.object({
  section_id: z.string().uuid(),
  label: z.string().min(1).max(100).default("Rule"),
  team_size: z.number().int().min(1),
  max_teams: z.number().int().min(1),
  slots: z.array(slotSchema).min(1, "At least one CGPA slot is required."),
}).refine((d) => {
  const total = d.slots.reduce((sum, s) => sum + s.count, 0);
  return total === d.team_size;
}, {
  message: "Sum of slot counts must equal team_size.",
  path: ["slots"],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "admin", "student"]);

    let query = supabase
      .from("team_formation_rules")
      .select("*, team_formation_slots(*)")
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

    const { section_id, label, team_size, max_teams, slots } = parsed.data;

    // Insert rule - keep legacy columns with placeholder values for compatibility
    const { data: rule, error: ruleError } = await supabase
      .from("team_formation_rules")
      .insert({
        faculty_id: userId,
        section_id,
        label,
        team_size,
        max_teams,
        formed_count: 0,
        // Legacy columns - kept for existing queries
        cgpa_lower: Math.min(...slots.map((s) => s.cgpa_lower)),
        cgpa_upper: Math.max(...slots.map((s) => s.cgpa_upper)),
        min_team_size: team_size,
        max_team_size: team_size,
      })
      .select("id, label, team_size, max_teams, formed_count, is_enabled, created_at, section_id")
      .single();

    if (ruleError) throw ruleError;

    // Insert slots
    const { data: insertedSlots, error: slotsError } = await supabase
      .from("team_formation_slots")
      .insert(slots.map((s) => ({ rule_id: rule.id, ...s })))
      .select();

    if (slotsError) {
      await supabase.from("team_formation_rules").delete().eq("id", rule.id);
      throw slotsError;
    }

    return NextResponse.json({ rule: { ...rule, team_formation_slots: insertedSlots } }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
