import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const rowSchema = z.object({
  full_name:     z.string().min(1).max(200),
  email:         z.string().email(),
  password:      z.string().min(8),
  role:          z.enum(["faculty", "student"]),
  usn:           z.string().regex(/^[A-Za-z0-9]{10}$/).optional(),
  department_id: z.string().uuid().optional(),
  section_id:    z.string().uuid().optional(),
  cgpa:          z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(10).optional()
  ),
});

export type BulkRowResult = {
  row: number;
  email: string;
  status: "success" | "error";
  error?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "Body must be a non-empty array." }, { status: 400 });
    }

    if (body.length > 200) {
      return NextResponse.json({ error: "Maximum 200 rows per upload." }, { status: 400 });
    }

    const service = getSupabaseServiceRoleClient();
    const results: BulkRowResult[] = [];

    for (let i = 0; i < body.length; i++) {
      const rawRow = body[i];
      const parsed = rowSchema.safeParse(rawRow);

      if (!parsed.success) {
        const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Validation failed.";
        results.push({ row: i + 1, email: String((rawRow as Record<string,unknown>).email ?? ""), status: "error", error: firstError });
        continue;
      }

      const { email, password, role, full_name, usn, department_id, section_id, cgpa } = parsed.data;

      if (role === "student") {
        if (!usn)           { results.push({ row: i + 1, email, status: "error", error: "USN is required for students." }); continue; }
        if (!department_id) { results.push({ row: i + 1, email, status: "error", error: "department_id is required for students." }); continue; }
        if (cgpa === undefined) { results.push({ row: i + 1, email, status: "error", error: "CGPA is required for students." }); continue; }
      }

      // Create auth user
      const { data: authData, error: authError } = await service.auth.admin.createUser({
        email, password, email_confirm: true,
      });

      if (authError) {
        const msg = authError.message.toLowerCase().includes("already")
          ? "Email already exists."
          : authError.message;
        results.push({ row: i + 1, email, status: "error", error: msg });
        continue;
      }

      const userId = authData.user.id;

      const { error: profileError } = await service.from("profiles").insert({ id: userId, role, full_name, email });
      if (profileError) {
        await service.auth.admin.deleteUser(userId);
        results.push({ row: i + 1, email, status: "error", error: profileError.message });
        continue;
      }

      if (role === "student") {
        const { error: studentError } = await service.from("students").insert({
          id: userId,
          usn: usn!.toUpperCase(),
          department_id: department_id!,
          section_id: section_id ?? null,
          cgpa: cgpa!,
        });
        if (studentError) {
          await service.from("profiles").delete().eq("id", userId);
          await service.auth.admin.deleteUser(userId);
          const msg = studentError.code === "23505" ? "USN already exists." : studentError.message;
          results.push({ row: i + 1, email, status: "error", error: msg });
          continue;
        }
      }

      results.push({ row: i + 1, email, status: "success" });
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount   = results.filter((r) => r.status === "error").length;

    return NextResponse.json({ results, successCount, errorCount }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
