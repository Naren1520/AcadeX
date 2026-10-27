interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

// In-memory store - suitable for development and single-instance deploys.
// Replace with Vercel KV or Redis in production multi-instance environments.
const store = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60_000;        // 60-second sliding window
const MAX_ATTEMPTS = 10;         // attempts before block
const BLOCK_DURATION_MS = 300_000; // 5-minute block

export function checkRateLimit(
  ip: string
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = store.get(ip);

  // Still blocked?
  if (record?.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // No record or window has expired - start fresh
  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    store.set(ip, { attempts: 1, firstAttemptAt: now });
    return { allowed: true };
  }

  const attempts = record.attempts + 1;

  if (attempts > MAX_ATTEMPTS) {
    store.set(ip, { ...record, attempts, blockedUntil: now + BLOCK_DURATION_MS });
    return { allowed: false, retryAfterSeconds: BLOCK_DURATION_MS / 1000 };
  }

  store.set(ip, { ...record, attempts });
  return { allowed: true };
}
