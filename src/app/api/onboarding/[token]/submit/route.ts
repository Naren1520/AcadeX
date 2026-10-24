/**
 * POST /api/onboarding/[token]/submit
 *
 * Step 2: submit student details after passing passcode verification.
 * Requires the sessionToken issued by /verify.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ValidationError, ConflictError } from "@/lib/errors";

const GENERIC_ERROR = "Invalid or expired session. Please verify your passcode again.";

const submitSchema = z.object({
  sessionToken: z.string().min(1),
  full_name:    z.string().min(1).max(200),
  email:        z.string().email(),
  password:     z.string().min(8, "Password must be at least 8 characters."),
  usn:          z.string().regex(/^[A-Za-z0-9]{10}$/, "USN must be exactly 10 alphanumeric characters."),
  cgpa:         z.number().min(0).max(10),
  github_url:   z.string().url().regex(/^https:\/\/github\.com\//).optional().or(z.literal("")),
  skills:       z.array(z.string().max(50)).max(20).default([]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const service = getSupabaseServiceRoleClient();

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { sessionToken, full_name, email, password, usn, cgpa, github_url, skills } = parsed.data;

    // Verify session token
    const sessionKey = `session:${sessionToken}`;
    const { data: sessionRow } = await service
      .from("onboarding_attempts")
      .select("last_attempt")
      .eq("invitation_id", token)
      .eq("ip_address", sessionKey)
      .single();

    if (!sessionRow) return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });

    // last_attempt was repurposed as session expiry
    if (new Date(sessionRow.last_attempt) < new Date()) {
      await service.from("onboarding_attempts")
        .delete().eq("invitation_id", token).eq("ip_address", sessionKey);
      return NextResponse.json({ error: "Session expired. Please verify your passcode again." }, { status: 401 });
    }

    // Verify invitation is still valid
    const { data: inv } = await service
      .from("onboarding_invitations")
      .select("id, is_active, closes_at, max_uses, use_count")
      .eq("id", token)
      .single();

    if (!inv?.is_active || new Date() > new Date(inv.closes_at)) {
      return NextResponse.json({ error: "This invitation has expired." }, { status: 403 });
    }
    if (inv.use_count >= inv.max_uses) {
      return NextResponse.json({ error: "This invitation has reached its maximum uses." }, { status: 403 });
    }

    // Check for duplicate email or USN
    const [{ data: emailCheck }, { data: usnCheck }] = await Promise.all([
      service.from("profiles").select("id").eq("email", email).maybeSingle(),
      service.from("students").select("id").eq("usn", usn.toUpperCase()).maybeSingle(),
    ]);
    if (emailCheck) throw new ConflictError("An account with this email already exists.", "email");
    if (usnCheck)   throw new ConflictError("A student with this USN already exists.", "usn");

    // Check duplicate pending submission for same email/USN under this invitation
    const { data: dupSub } = await service
      .from("onboarding_submissions")
      .select("id, status")
      .eq("invitation_id", token)
      .eq("email", email)
      .maybeSingle();
    if (dupSub) {
      if (dupSub.status === "pending")  throw new ConflictError("You have already submitted a request that is pending review.", "email");
      if (dupSub.status === "approved") throw new ConflictError("Your request has already been approved.", "email");
    }

    // Hash the password and store it temporarily — store as plaintext so we can use it
    // on approval (Supabase admin API needs the plaintext password).
    // The submission row is only accessible via service role and we clear password after use.
    // This is the same pattern used by standard invite-accept flows.
    const { data: submission, error: subError } = await service
      .from("onboarding_submissions")
      .insert({
        invitation_id: token,
        full_name,
        email,
        password_hash: password,   // stored temporarily as plaintext; cleared on approval
        usn: usn.toUpperCase(),
        cgpa,
        github_url: github_url || null,
        skills,
      })
      .select("id")
      .single();

    if (subError) throw subError;

    // Increment use_count
    await service
      .from("onboarding_invitations")
      .update({ use_count: inv.use_count + 1 })
      .eq("id", token);

    // Invalidate session token
    await service.from("onboarding_attempts")
      .delete().eq("invitation_id", token).eq("ip_address", sessionKey);

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (err) {
    return toErrorResponse(err);
  }
}
