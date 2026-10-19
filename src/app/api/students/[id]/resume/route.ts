import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserWithRole, requireOwnerOrAdmin } from "@/server/authorization";
import { uploadArtefact } from "@/server/storage";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId, role } = await getAuthenticatedUserWithRole(supabase);
    await requireOwnerOrAdmin(supabase, userId, studentId);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ValidationError("A file is required.", { file: "Must be a valid file upload." });
    }

    // Get student record for storage path
    const { data: student } = await supabase
      .from("students")
      .select("department_id, usn")
      .eq("id", studentId)
      .single();
    if (!student) throw new NotFoundError("Student record not found.");

    const storagePath = `resumes/${student.department_id}/${studentId}/${file.name}`;

    const { storagePath: savedPath } = await uploadArtefact({
      file,
      category: "resume",
      path: storagePath,
      actorId: userId,
      actorRole: role as "admin" | "faculty" | "student",
    });

    // Update resume_path in students table
    await supabase
      .from("students")
      .update({ resume_path: savedPath })
      .eq("id", studentId);

    return NextResponse.json({ storagePath: savedPath }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
