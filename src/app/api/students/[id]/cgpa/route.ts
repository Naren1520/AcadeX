import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole, requireFacultyAssignment, getAuthenticatedUserWithRole } from "@/server/authorization";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { cgpaSchema } from "@/lib/validation";

const updateSchema = z.object({
  cgpa: cgpaSchema,
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId, role } = await getAuthenticatedUserWithRole(supabase);

    // Students cannot update their own CGPA
    if (role === "student") {
      throw new ForbiddenError("Students cannot update their own CGPA.");
    }

    // Faculty must have an assignment to the student's department
    if (role === "faculty") {
      const { data: student } = await supabase
        .from("students")
        .select("department_id")
        .eq("id", studentId)
        .single();
      if (!student) throw new NotFoundError("Student not found.");
      await requireFacultyAssignment(supabase, userId, { departmentId: student.department_id });
    }

    // Admin can always update
    if (role !== "admin" && role !== "faculty") {
      throw new ForbiddenError("Not authorised.");
    }

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    // Get previous CGPA for audit log
    const { data: current } = await supabase
      .from("students")
      .select("cgpa")
      .eq("id", studentId)
      .single();
    if (!current) throw new NotFoundError("Student record not found.");

    const { data, error } = await supabase
      .from("students")
      .update({ cgpa: parsed.data.cgpa })
      .eq("id", studentId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Student not found.");

    writeAuditLog({
      actorId: userId,
      actorRole: role,
      actionType: AuditEventTypes.CGPA_UPDATED,
      targetTable: "students",
      targetRecordId: studentId,
      previousValue: { cgpa: current.cgpa },
      newValue: { cgpa: parsed.data.cgpa },
    });

    return NextResponse.json({ student: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
