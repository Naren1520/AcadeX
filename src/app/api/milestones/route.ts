import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError } from "@/lib/errors";
import { isFutureDate } from "@/lib/dates";

const createSchema = z.object({
  proposal_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  deadline: z.string().datetime(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["faculty", "student", "admin"]);

    let query = supabase
      .from("milestones")
      .select("*")
      .order("deadline", { ascending: true });
    if (proposalId) query = query.eq("proposal_id", proposalId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ milestones: data });
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

    if (!isFutureDate(new Date(parsed.data.deadline))) {
      throw new ValidationError("Milestone deadline must be a future date.", { deadline: "Must be in the future." });
    }

    const { data, error } = await supabase
      .from("milestones")
      .insert({ ...parsed.data, faculty_id: userId })
      .select()
      .single();

    if (error) throw error;

    writeAuditLog({
      actorId: userId,
      actorRole: "faculty",
      actionType: AuditEventTypes.MILESTONE_CREATED,
      targetTable: "milestones",
      targetRecordId: data.id,
      newValue: { name: data.name, deadline: data.deadline },
    });

    return NextResponse.json({ milestone: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
