import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserWithRole, requireOwnerOrAdmin, requireFacultyAssignment } from "@/server/authorization";
import { generateSignedUrl } from "@/server/storage";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ForbiddenError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId, role } = await getAuthenticatedUserWithRole(supabase);

    const { data: student } = await supabase
      .from("students")
      .select("resume_path, department_id")
      .eq("id", studentId)
      .single();

    if (!student) throw new NotFoundError("Student record not found.");
    if (!student.resume_path) throw new NotFoundError("No resume uploaded.");

    // Access control: owner, assigned faculty, or admin
    if (role === "faculty") {
      await requireFacultyAssignment(supabase, userId, { departmentId: student.department_id });
    } else if (role === "student") {
      await requireOwnerOrAdmin(supabase, userId, studentId);
    } else if (role !== "admin") {
      throw new ForbiddenError();
    }

    const signedUrl = await generateSignedUrl(
      student.resume_path,
      userId,
      role as "admin" | "faculty" | "student"
    );

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    return toErrorResponse(err);
  }
}
