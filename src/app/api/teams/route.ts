import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { formTeam } from "@/server/workflows/teamFormationEngine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";

const formTeamSchema = z.object({
  section_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  team_name: z.string().min(1).max(100),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "admin", "student"]);

    let query = supabase
      .from("teams")
      .select("*, team_formation_rules(cgpa_lower, cgpa_upper, min_team_size, max_team_size)")
      .order("created_at", { ascending: false });
    if (sectionId) query = query.eq("section_id", sectionId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ teams: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = formTeamSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const team = await formTeam({
      studentId: userId,
      sectionId: parsed.data.section_id,
      ruleId: parsed.data.rule_id,
      teamName: parsed.data.team_name,
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
