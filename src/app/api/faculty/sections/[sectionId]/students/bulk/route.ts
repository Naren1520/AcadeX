import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError } from "@/lib/errors";

async function requireManagePermission(
  facultyId: string,
  sectionId: string
): Promise<{ departmentId: string }> {
  const service = getSupabaseServiceRoleClient();
  const { data } = await service
    .from("faculty_assignments")
    .select("can_manage_students, department_id")
    .eq("faculty_id", facultyId)
    .eq("section_id", sectionId)
    .single();

  if (!data) throw new ForbiddenError("You are not assigned to this section.");
  if (!data.can_manage_students)
    throw new ForbiddenError("You do not have permission to manage students in this section.");

  return { departmentId: data.department_id };
}

const rowSchema = z.object({
  full_name: z.string().min(1).max(200),
  email:     z.string().email(),
  password:  z.string().min(8),
  usn:       z.string().regex(/^[A-Za-z0-9]{10}$/),
  cgpa:      z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(10)
  ),
});

export type BulkStudentResult = {
  row: number;
  email: string;
  status: "success" | "error";
  error?: string;
};

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

    if (!Array.isArray(body) || body.length === 0)
      return NextResponse.json({ error: "Body must be a non-empty array." }, { status: 400 });
    if (body.length > 200)
      return NextResponse.json({ error: "Maximum 200 rows per upload." }, { status: 400 });

    const service = getSupabaseServiceRoleClient();
    const results: BulkStudentResult[] = [];

    for (let i = 0; i < body.length; i++) {
      const raw = body[i];
      const parsed = rowSchema.safeParse(raw);

      if (!parsed.success) {
        const firstError =
          Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Validation failed.";
        results.push({
          row: i + 1,
          email: String((raw as Record<string, unknown>).email ?? ""),
          status: "error",
          error: firstError,
        });
        continue;
      }

      const { full_name, email, password, usn, cgpa } = parsed.data;

      // Create auth user
      const { data: authData, error: authError } =
        await service.auth.admin.createUser({ email, password, email_confirm: true });

      if (authError) {
        results.push({
          row: i + 1, email, status: "error",
          error: authError.message.toLowerCase().includes("already")
            ? "Email already exists."
            : authError.message,
        });
        continue;
      }

      const userId = authData.user.id;

      const { error: profileError } = await service
        .from("profiles")
        .insert({ id: userId, role: "student", full_name, email });

      if (profileError) {
        await service.auth.admin.deleteUser(userId);
        results.push({ row: i + 1, email, status: "error", error: profileError.message });
        continue;
      }

      const { error: studentError } = await service
        .from("students")
        .insert({ id: userId, usn: usn.toUpperCase(), department_id: departmentId, section_id: sectionId, cgpa });

      if (studentError) {
        await service.from("profiles").delete().eq("id", userId);
        await service.auth.admin.deleteUser(userId);
        results.push({
          row: i + 1, email, status: "error",
          error: studentError.code === "23505" ? "USN already exists." : studentError.message,
        });
        continue;
      }

      results.push({ row: i + 1, email, status: "success" });
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount   = results.filter((r) => r.status === "error").length;
    return NextResponse.json({ results, successCount, errorCount });
  } catch (err) {
    return toErrorResponse(err);
  }
}
