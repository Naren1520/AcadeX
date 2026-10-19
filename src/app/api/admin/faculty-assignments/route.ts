import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";

const createSchema = z.object({
  faculty_id: z.string().uuid(),
  section_id: z.string().uuid(),
  department_id: z.string().uuid(),
});

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);
    const { data, error } = await supabase
      .from("faculty_assignments")
      .select("*, profiles(full_name, email), sections(label), departments(name, code)")
      .order("assigned_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ assignments: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["admin"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    // Verify faculty profile exists with role 'faculty'
    const { data: facultyProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", parsed.data.faculty_id)
      .eq("role", "faculty")
      .single();

    if (!facultyProfile) {
      throw new ValidationError("Faculty member not found or does not have faculty role.", { faculty_id: "Must be a valid faculty user." });
    }

    const { data, error } = await supabase
      .from("faculty_assignments")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ConflictError("This faculty member is already assigned to this section.", "section_id");
      throw error;
    }

    writeAuditLog({
      actorId: userId,
      actorRole: "admin",
      actionType: AuditEventTypes.TEAM_MEMBER_ADDED,
      targetTable: "faculty_assignments",
      targetRecordId: data.id,
      newValue: parsed.data,
    });

    return NextResponse.json({ assignment: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
