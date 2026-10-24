import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";
import { createHash } from "crypto";

function hashPasscode(p: string) { return createHash("sha256").update(p).digest("hex"); }

const patchSchema = z.object({
  label:     z.string().min(1).max(100).optional(),
  opens_at:  z.string().datetime().optional(),
  closes_at: z.string().datetime().optional(),
  max_uses:  z.number().int().min(1).max(500).optional(),
  is_active: z.boolean().optional(),
  passcode:  z.string().min(6).max(32).optional(), // change the passcode
}).refine((d) => {
  if (d.opens_at && d.closes_at) return new Date(d.closes_at) > new Date(d.opens_at);
  return true;
}, { message: "closes_at must be after opens_at", path: ["closes_at"] });

// PATCH — update invitation settings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const service = getSupabaseServiceRoleClient();
    const { data: existing } = await service
      .from("onboarding_invitations")
      .select("id, faculty_id")
      .eq("id", id)
      .single();

    if (!existing) throw new NotFoundError("Invitation not found.");
    if (existing.faculty_id !== userId) throw new ForbiddenError("Not your invitation.");

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const { passcode, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (passcode) update.passcode_hash = hashPasscode(passcode);

    const { data, error } = await service
      .from("onboarding_invitations")
      .update(update)
      .eq("id", id)
      .select("id, label, opens_at, closes_at, max_uses, use_count, is_active")
      .single();

    if (error) throw error;
    return NextResponse.json({ invitation: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE — deactivate invitation
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const service = getSupabaseServiceRoleClient();
    const { data: existing } = await service
      .from("onboarding_invitations")
      .select("id, faculty_id")
      .eq("id", id).single();

    if (!existing) throw new NotFoundError("Invitation not found.");
    if (existing.faculty_id !== userId) throw new ForbiddenError("Not your invitation.");

    await service.from("onboarding_invitations").update({ is_active: false }).eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
