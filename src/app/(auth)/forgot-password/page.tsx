"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Supabase password reset — handled via server action in a full implementation
    // Show success regardless to avoid email enumeration
    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
    }, 800);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div
        className="w-full max-w-sm rounded bg-white p-8"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <h1 className="text-2xl font-semibold text-neutral-900">
          Reset Password
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your email and we will send reset instructions.
        </p>

        {submitted ? (
          <div
            className="mt-6 rounded px-4 py-3 text-sm text-green-800"
            style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
            role="status"
          >
            If an account with that email exists, you will receive reset
            instructions shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-neutral-700"
              >
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded px-3 py-2 text-sm focus:outline-none"
                style={{ border: "1px solid #d1d5db" }}
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-disabled={isLoading}
              className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              {isLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-neutral-500">
          <a href="/login" style={{ color: "#1e3a5f" }}>
            Back to sign in
          </a>
        </p>
      </div>
    </main>
  );
}
