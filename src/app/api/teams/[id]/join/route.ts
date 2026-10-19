import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { joinTeam } from "@/server/workflows/teamFormationEngine";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";

const joinSchema = z.object({
  section_id: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const result = await joinTeam({
      studentId: userId,
      teamId,
      sectionId: parsed.data.section_id,
    });

    return NextResponse.json({ team: result });
  } catch (err) {
    return toErrorResponse(err);
  }
}
