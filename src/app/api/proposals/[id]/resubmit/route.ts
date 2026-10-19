import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { sdgNumberSchema } from "@/lib/validation";

const resubmitSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  sdg_numbers: z.array(sdgNumberSchema).min(1).max(17),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: originalId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = resubmitSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data: original } = await supabase
      .from("proposals")
      .select("status, team_id, faculty_id, version")
      .eq("id", originalId)
      .single();

    if (!original) throw new NotFoundError("Proposal not found.");

    // Only allowed if original status is revision_requested
    if (original.status !== "revision_requested") {
      throw new ValidationError(
        `Cannot resubmit a proposal with status "${original.status}". Only revision_requested proposals can be resubmitted.`,
        { status: "Must be revision_requested." }
      );
    }

    const { data: newProposal, error } = await supabase
      .from("proposals")
      .insert({
        team_id: original.team_id,
        faculty_id: original.faculty_id,
        title: parsed.data.title,
        description: parsed.data.description,
        status: "pending",
        parent_proposal_id: originalId,
        version: original.version + 1,
      })
      .select()
      .single();

    if (error || !newProposal) throw error ?? new Error("Failed to create resubmission.");

    await supabase.from("proposal_sdgs").insert(
      parsed.data.sdg_numbers.map((n) => ({ proposal_id: newProposal.id, sdg_number: n }))
    );

    writeAuditLog({
      actorId: userId,
      actorRole: "student",
      actionType: AuditEventTypes.PROPOSAL_SUBMITTED,
      targetTable: "proposals",
      targetRecordId: newProposal.id,
      newValue: { parentProposalId: originalId, version: newProposal.version },
    });

    return NextResponse.json({ proposal: newProposal }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
