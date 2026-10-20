"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MfaPage() {
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadFactors() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.[0];
      if (totp) setFactorId(totp.id);
    }
    loadFactors();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factorId, code }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "MFA verification failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div
        className="w-full max-w-sm rounded bg-white p-8"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <h1 className="text-2xl font-semibold text-neutral-900">
          Two-Factor Authentication
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter the 6-digit code from your authenticator app.
        </p>

        {error && (
          <p
            id="mfa-error"
            role="alert"
            className="mt-3 rounded px-3 py-2 text-sm text-red-700"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="mfa-code"
              className="block text-sm font-medium text-neutral-700"
            >
              Authentication Code
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              aria-describedby={error ? "mfa-error" : undefined}
              aria-invalid={error ? true : undefined}
              className="mt-1 block w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={{
                border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
              }}
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !factorId || code.length !== 6}
            aria-disabled={isLoading || !factorId || code.length !== 6}
            className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {isLoading ? "Verifyingâ€¦" : "Verify Code"}
          </button>
        </form>
      </div>
    </main>
  );
}
