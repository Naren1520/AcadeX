import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";

const editSchema = z.object({
  full_name:     z.string().min(1).max(200).optional(),
  email:         z.string().email().optional(),
  password:      z.string().min(8).optional(),
  // student-only
  usn:           z.string().regex(/^[A-Za-z0-9]{10}$/).optional(),
  department_id: z.string().uuid().optional(),
  cgpa:          z.number().min(0).max(10).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const service = getSupabaseServiceRoleClient();

    const { data: profile } = await service
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (!profile) throw new NotFoundError("User not found.");
    if (profile.role === "admin") throw new ForbiddenError("Admin accounts cannot be edited here.");

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = editSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { full_name, email, password, usn, department_id, cgpa } = parsed.data;

    // Update profile (full_name, email)
    if (full_name || email) {
      const profileUpdate: Record<string, unknown> = {};
      if (full_name) profileUpdate.full_name = full_name;
      if (email)     profileUpdate.email     = email;
      const { error: profileError } = await service.from("profiles").update(profileUpdate).eq("id", id);
      if (profileError) {
        if (profileError.code === "23505") throw new ConflictError("Email already in use.", "email");
        throw profileError;
      }
    }

    // Update auth (email and/or password)
    if (email || password) {
      const authUpdate: Record<string, unknown> = {};
      if (email)    authUpdate.email    = email;
      if (password) authUpdate.password = password;
      const { error: authError } = await service.auth.admin.updateUserById(id, authUpdate);
      if (authError) throw authError;
    }

    // Update student-specific fields
    if (profile.role === "student" && (usn || department_id || cgpa !== undefined)) {
      const studentUpdate: Record<string, unknown> = {};
      if (usn)           studentUpdate.usn           = usn.toUpperCase();
      if (department_id) studentUpdate.department_id = department_id;
      if (cgpa !== undefined) studentUpdate.cgpa     = cgpa;

      const { error: studentError } = await service.from("students").update(studentUpdate).eq("id", id);
      if (studentError) {
        if (studentError.code === "23505") throw new ConflictError("USN already in use by another student.", "usn");
        throw studentError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId: adminId } = await requireRole(supabase, ["admin"]);

    if (id === adminId) throw new ForbiddenError("You cannot delete your own account.");

    const service = getSupabaseServiceRoleClient();

    const { data: profile } = await service
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (!profile) throw new NotFoundError("User not found.");
    if (profile.role === "admin") throw new ForbiddenError("Admin accounts cannot be deleted through this endpoint.");

    const { error } = await service.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
