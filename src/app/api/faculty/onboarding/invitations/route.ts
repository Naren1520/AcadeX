import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { requireFacultyAssignment } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError, ForbiddenError } from "@/lib/errors";
import { createHash, randomBytes } from "crypto";

// We hash the passcode with SHA-256 (fast, not bcrypt, since it's a short-lived code
// and we never store the plaintext — bcrypt is reserved for long-lived passwords)
function hashPasscode(passcode: string): string {
  return createHash("sha256").update(passcode).digest("hex");
}

const createSchema = z.object({
  section_id:    z.string().uuid(),
  department_id: z.string().uuid(),
  label:         z.string().min(1).max(100).default("Student Onboarding"),
  passcode:      z.string().min(6).max(32),
  opens_at:      z.string().datetime(),
  closes_at:     z.string().datetime(),
  max_uses:      z.number().int().min(1).max(500).default(100),
}).refine((d) => new Date(d.closes_at) > new Date(d.opens_at), {
  message: "closes_at must be after opens_at",
  path: ["closes_at"],
});

// GET — list faculty's own invitations for a section
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section_id");

    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const service = getSupabaseServiceRoleClient();
    let query = service
      .from("onboarding_invitations")
      .select("id, label, opens_at, closes_at, max_uses, use_count, is_active, created_at, section_id")
      .eq("faculty_id", userId)
      .order("created_at", { ascending: false });

    if (sectionId) query = query.eq("section_id", sectionId);

    const { data, error } = await query;
    if (error) throw error;

    // Never return the passcode_hash
    return NextResponse.json({ invitations: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST — create a new invitation
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

    const { section_id, department_id, label, passcode, opens_at, closes_at, max_uses } = parsed.data;

    // Verify this faculty is assigned to this section
    await requireFacultyAssignment(supabase, userId, { sectionId: section_id });

    const service = getSupabaseServiceRoleClient();

    const { data, error } = await service
      .from("onboarding_invitations")
      .insert({
        faculty_id:    userId,
        section_id,
        department_id,
        label,
        passcode_hash: hashPasscode(passcode),
        opens_at,
        closes_at,
        max_uses,
      })
      .select("id, label, opens_at, closes_at, max_uses, use_count, is_active, created_at, section_id")
      .single();

    if (error) throw error;

    return NextResponse.json({ invitation: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
