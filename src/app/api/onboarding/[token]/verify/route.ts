/**
 * POST /api/onboarding/[token]/verify
 *
 * Step 1 of student onboarding: verify the passcode.
 * Returns a short-lived session token on success.
 *
 * Security:
 * - Progressive rate limiting per (token, IP)
 * - Generic error messages - does not reveal if invitation exists
 * - Checks invitation window, active status, max_uses
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { checkOnboardingRateLimit, resetOnboardingAttempts } from "@/lib/onboardingRateLimit";
import { createHash, randomBytes } from "crypto";

// Generic error - never reveal whether the token is valid
const GENERIC_ERROR = "Invalid or expired invitation. Please check the link and passcode.";

function hashPasscode(p: string) { return createHash("sha256").update(p).digest("hex"); }

const bodySchema = z.object({
  passcode: z.string().min(1).max(64),
});

function getIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const ip = getIp(request);

    // Rate limit BEFORE any DB lookup to prevent enumeration
    const rateCheck = await checkOnboardingRateLimit(token, ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 300) } }
      );
    }

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });

    const { passcode } = parsed.data;
    const service = getSupabaseServiceRoleClient();

    // Look up invitation
    const { data: inv } = await service
      .from("onboarding_invitations")
      .select("id, passcode_hash, opens_at, closes_at, max_uses, use_count, is_active")
      .eq("id", token)
      .single();

    // Timing-safe: always hash the passcode even if invitation not found
    const inputHash = hashPasscode(passcode);
    const storedHash = inv?.passcode_hash ?? "0".repeat(64);
    const hashMatch = inputHash === storedHash;

    if (!inv || !hashMatch || !inv.is_active) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const now = new Date();
    if (now < new Date(inv.opens_at)) {
      return NextResponse.json({ error: "This invitation is not open yet." }, { status: 403 });
    }
    if (now > new Date(inv.closes_at)) {
      return NextResponse.json({ error: "This invitation has expired." }, { status: 403 });
    }
    if (inv.use_count >= inv.max_uses) {
      return NextResponse.json({ error: "This invitation has reached its maximum uses." }, { status: 403 });
    }

    // Success - reset rate limit and issue a session token
    await resetOnboardingAttempts(token, ip);

    // Session token: signed with timestamp for expiry validation in the submit step
    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store session token in DB so the submit step can verify it
    await service.from("onboarding_attempts").upsert({
      invitation_id: token,
      ip_address: `session:${sessionToken}`,
      attempts: 0,
      first_attempt: new Date().toISOString(),
      last_attempt: new Date(expiresAt).toISOString(), // reuse last_attempt as expiry
    }, { onConflict: "invitation_id,ip_address" });

    return NextResponse.json({ sessionToken, expiresAt });
  } catch (err) {
    return toErrorResponse(err);
  }
}
