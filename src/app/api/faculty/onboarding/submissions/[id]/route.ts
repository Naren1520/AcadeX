import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from "@/lib/errors";

const actionSchema = z.object({
  action:         z.enum(["approve", "reject"]),
  rejection_note: z.string().min(5).max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["faculty"]);

    const service = getSupabaseServiceRoleClient();

    // Load submission with invitation details
    const { data: sub } = await service
      .from("onboarding_submissions")
      .select("*, onboarding_invitations(faculty_id, section_id, department_id)")
      .eq("id", id)
      .single();

    if (!sub) throw new NotFoundError("Submission not found.");

    type Inv = { faculty_id: string; section_id: string; department_id: string };
    const inv = sub.onboarding_invitations as unknown as Inv | null;

    if (!inv || inv.faculty_id !== userId) throw new ForbiddenError("Not your submission.");
    if (sub.status !== "pending") throw new ConflictError(`Submission is already ${sub.status}.`);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { action, rejection_note } = parsed.data;

    // ── REJECT ────────────────────────────────────────────────
    if (action === "reject") {
      if (!rejection_note) {
        throw new ValidationError("rejection_note is required when rejecting.", { rejection_note: "Required" });
      }
      await service
        .from("onboarding_submissions")
        .update({ status: "rejected", rejection_note, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      return NextResponse.json({ success: true, status: "rejected" });
    }

    // ── APPROVE ───────────────────────────────────────────────
    // Check duplicates
    const [{ data: emailExists }, { data: usnExists }] = await Promise.all([
      service.from("profiles").select("id").eq("email", sub.email).maybeSingle(),
      service.from("students").select("id").eq("usn", sub.usn.toUpperCase()).maybeSingle(),
    ]);
    if (emailExists) throw new ConflictError("A user with this email already exists.", "email");
    if (usnExists)   throw new ConflictError("A student with this USN already exists.", "usn");

    // password_hash stores the student's own password (plaintext, temporarily)
    // It is only accessible via service role and cleared after account creation
    const studentPassword: string = sub.password_hash;
    if (!studentPassword || studentPassword.length < 8) {
      throw new ValidationError("Submission is missing a valid password. Student must resubmit.", {});
    }

    // Create auth user with the student's own chosen password
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email:         sub.email,
      password:      studentPassword,
      email_confirm: true,
    });
    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        throw new ConflictError("Email already registered.", "email");
      }
      throw authError;
    }

    const newUserId = authData.user.id;

    // Create profile
    const { error: profileError } = await service.from("profiles").insert({
      id: newUserId, role: "student", full_name: sub.full_name, email: sub.email,
    });
    if (profileError) {
      await service.auth.admin.deleteUser(newUserId);
      throw profileError;
    }

    // Create student record in the correct section + department
    const { error: studentError } = await service.from("students").insert({
      id:            newUserId,
      usn:           sub.usn.toUpperCase(),
      department_id: inv.department_id,
      section_id:    inv.section_id,
      cgpa:          sub.cgpa,
      github_url:    sub.github_url ?? null,
      skills:        sub.skills    ?? [],
    });
    if (studentError) {
      await service.from("profiles").delete().eq("id", newUserId);
      await service.auth.admin.deleteUser(newUserId);
      if (studentError.code === "23505") throw new ConflictError("USN already exists.", "usn");
      throw studentError;
    }

    // Mark approved and clear the stored password
    await service
      .from("onboarding_submissions")
      .update({
        status:          "approved",
        reviewed_at:     new Date().toISOString(),
        created_user_id: newUserId,
        password_hash:   "", // clear immediately after use
      })
      .eq("id", id);

    return NextResponse.json({ success: true, status: "approved" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
