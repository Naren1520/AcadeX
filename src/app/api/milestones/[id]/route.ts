import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { isFutureDate, isPastDate } from "@/lib/dates";

const updateSchema = z.object({
  deadline: z.string().datetime(),
});

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

    const { data: current } = await supabase
      .from("milestones")
      .select("deadline, faculty_id")
      .eq("id", id)
      .single();

    if (!current) throw new NotFoundError("Milestone not found.");

    // Cannot update if original deadline has already passed
    if (isPastDate(new Date(current.deadline))) {
      throw new ValidationError("Cannot update a milestone whose deadline has already passed.", {
        deadline: "Original deadline has passed.",
      });
    }

    // New deadline must be in the future
    if (!isFutureDate(new Date(parsed.data.deadline))) {
      throw new ValidationError("New deadline must be a future date.", { deadline: "Must be in the future." });
    }

    const { data: updated, error } = await supabase
      .from("milestones")
      .update({ deadline: parsed.data.deadline })
      .eq("id", id)
      .eq("faculty_id", userId)
      .select()
      .single();

    if (error || !updated) throw new NotFoundError("Milestone not found or you do not own it.");

    writeAuditLog({
      actorId: userId,
      actorRole: "faculty",
      actionType: AuditEventTypes.MILESTONE_DEADLINE_UPDATED,
      targetTable: "milestones",
      targetRecordId: id,
      previousValue: { deadline: current.deadline },
      newValue: { deadline: parsed.data.deadline },
    });

    return NextResponse.json({ milestone: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
