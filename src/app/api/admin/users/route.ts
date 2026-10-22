import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";
import { writeAuditLog, AuditEventTypes, extractRequestMeta } from "@/server/audit";

const createUserSchema = z.object({
  email:      z.string().email(),
  password:   z.string().min(8, "Password must be at least 8 characters."),
  role:       z.enum(["faculty", "student"]),
  full_name:  z.string().min(1).max(200),
  // student-only fields
  usn:          z.string().regex(/^[A-Za-z0-9]{10}$/, "USN must be exactly 10 alphanumeric characters.").optional(),
  department_id: z.string().uuid().optional(),
  section_id:    z.string().uuid().optional(),
  cgpa:          z.number().min(0).max(10).optional(),
});

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const service = getSupabaseServiceRoleClient();
    const { data, error } = await service
      .from("profiles")
      .select("id, role, full_name, email, created_at")
      .in("role", ["faculty", "student"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId: adminUserId } = await requireRole(supabase, ["admin"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { email, password, role, full_name, usn, department_id, section_id, cgpa } = parsed.data;

    // Student must provide usn, department_id, cgpa
    if (role === "student") {
      if (!usn)          throw new ValidationError("USN is required for students.", { usn: "Required" });
      if (!department_id) throw new ValidationError("Department is required for students.", { department_id: "Required" });
      if (cgpa === undefined) throw new ValidationError("CGPA is required for students.", { cgpa: "Required" });
    }

    const service = getSupabaseServiceRoleClient();

    // Create the auth user via service role
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        throw new ConflictError("A user with this email already exists.", "email");
      }
      throw authError;
    }

    const userId = authData.user.id;

    // Create profile row
    const { error: profileError } = await service.from("profiles").insert({
      id: userId, role, full_name, email,
    });

    if (profileError) {
      await service.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // If student, create student row
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
        if (studentError.code === "23505") throw new ConflictError("A student with this USN already exists.", "usn");
        throw studentError;
      }
    }

    const { ipAddress, userAgent } = extractRequestMeta(request);
    writeAuditLog({
      actorId: adminUserId, actorRole: "admin",
      actionType: AuditEventTypes.USER_CREATED,
      targetTable: "profiles", targetRecordId: userId,
      newValue: { email, role, full_name },
      ipAddress, userAgent,
    });

    return NextResponse.json({ user: { id: userId, email, role, full_name } }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
