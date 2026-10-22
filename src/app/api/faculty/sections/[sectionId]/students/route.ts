import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";

/** Verify this faculty has can_manage_students=true for the given section, return department_id */
async function requireManagePermission(facultyId: string, sectionId: string): Promise<{ departmentId: string }> {
  const service = getSupabaseServiceRoleClient();
  const { data: assignment } = await service
    .from("faculty_assignments")
    .select("id, can_manage_students, department_id")
    .eq("faculty_id", facultyId)
    .eq("section_id", sectionId)
    .single();

  if (!assignment) throw new ForbiddenError("You are not assigned to this section.");
  if (!assignment.can_manage_students) {
    throw new ForbiddenError("You do not have permission to manage students in this section.");
  }
  return { departmentId: assignment.department_id };
}

// ── POST: create a new student and place them in the section ──
const createSchema = z.object({
  full_name: z.string().min(1).max(200),
  email:     z.string().email(),
  password:  z.string().min(8),
  usn:       z.string().regex(/^[A-Za-z0-9]{10}$/, "USN must be exactly 10 alphanumeric characters."),
  cgpa:      z.number().min(0).max(10),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId: facultyId } = await requireRole(supabase, ["faculty"]);

    const { departmentId } = await requireManagePermission(facultyId, sectionId);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { full_name, email, password, usn, cgpa } = parsed.data;
    const service = getSupabaseServiceRoleClient();

    // Create auth user
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) {
      const msg = authError.message.toLowerCase().includes("already")
        ? "A user with this email already exists."
        : authError.message;
      if (authError.message.toLowerCase().includes("already")) throw new ConflictError(msg, "email");
      throw authError;
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await service.from("profiles").insert({
      id: userId, role: "student", full_name, email,
    });
    if (profileError) {
      await service.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // Create student row — already assigned to this section
    const { error: studentError } = await service.from("students").insert({
      id: userId,
      usn: usn.toUpperCase(),
      department_id: departmentId,
      section_id: sectionId,
      cgpa,
    });
    if (studentError) {
      await service.from("profiles").delete().eq("id", userId);
      await service.auth.admin.deleteUser(userId);
      if (studentError.code === "23505") throw new ConflictError("A student with this USN already exists.", "usn");
      throw studentError;
    }

    return NextResponse.json(
      { student: { id: userId, usn: usn.toUpperCase(), full_name, email, cgpa } },
      { status: 201 }
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ── DELETE: remove a student from the section (unassign only) ─
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId: facultyId } = await requireRole(supabase, ["faculty"]);

    await requireManagePermission(facultyId, sectionId);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    if (!studentId) return NextResponse.json({ error: "student_id query param required." }, { status: 400 });

    const service = getSupabaseServiceRoleClient();

    const { data: student } = await service
      .from("students").select("id, section_id").eq("id", studentId).single();
    if (!student) throw new NotFoundError("Student not found.");
    if (student.section_id !== sectionId) throw new ForbiddenError("Student is not in this section.");

    const { error } = await service
      .from("students").update({ section_id: null }).eq("id", studentId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
