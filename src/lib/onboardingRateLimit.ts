import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";

/**
 * Progressive cooldown schedule (attempts → block duration in seconds):
 *   1–3  : allowed (no block)
 *   4–5  : 30-second block
 *   6–8  : 5-minute block
 *   9–11 : 30-minute block
 *   12+  : 24-hour block
 *
 * Window resets after 1 hour of inactivity.
 */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function blockDurationSeconds(attempts: number): number {
  if (attempts <= 3)  return 0;
  if (attempts <= 5)  return 30;
  if (attempts <= 8)  return 5 * 60;
  if (attempts <= 11) return 30 * 60;
  return 24 * 60 * 60;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  attemptsUsed?: number;
}

export async function checkOnboardingRateLimit(
  invitationId: string,
  ip: string
): Promise<RateLimitResult> {
  const service = getSupabaseServiceRoleClient();
  const now = new Date();

  const { data: existing } = await service
    .from("onboarding_attempts")
    .select("*")
    .eq("invitation_id", invitationId)
    .eq("ip_address", ip)
    .single();

  // Still blocked?
  if (existing?.blocked_until && new Date(existing.blocked_until) > now) {
    const retryAfterSeconds = Math.ceil(
      (new Date(existing.blocked_until).getTime() - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  // Window expired → reset
  if (
    existing &&
    now.getTime() - new Date(existing.first_attempt).getTime() > WINDOW_MS
  ) {
    await service
      .from("onboarding_attempts")
      .update({ attempts: 1, first_attempt: now.toISOString(), last_attempt: now.toISOString(), blocked_until: null })
      .eq("invitation_id", invitationId)
      .eq("ip_address", ip);
    return { allowed: true, attemptsUsed: 1 };
  }

  const newAttempts = (existing?.attempts ?? 0) + 1;
  const blockSec    = blockDurationSeconds(newAttempts);
  const blockedUntil = blockSec > 0
    ? new Date(now.getTime() + blockSec * 1000).toISOString()
    : null;

  if (existing) {
    await service
      .from("onboarding_attempts")
      .update({ attempts: newAttempts, last_attempt: now.toISOString(), blocked_until: blockedUntil })
      .eq("invitation_id", invitationId)
      .eq("ip_address", ip);
  } else {
    await service
      .from("onboarding_attempts")
      .insert({ invitation_id: invitationId, ip_address: ip, attempts: newAttempts, blocked_until: blockedUntil });
  }

  if (blockSec > 0) {
    return { allowed: false, retryAfterSeconds: blockSec };
  }
  return { allowed: true, attemptsUsed: newAttempts };
}

/** Call on successful passcode verify to reset the attempt counter */
export async function resetOnboardingAttempts(
  invitationId: string,
  ip: string
): Promise<void> {
  const service = getSupabaseServiceRoleClient();
  await service
    .from("onboarding_attempts")
    .delete()
    .eq("invitation_id", invitationId)
    .eq("ip_address", ip);
}
