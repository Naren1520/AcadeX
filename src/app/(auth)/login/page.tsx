"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Invalid credentials. Please check your email and password.");
      setIsLoading(false);
      return;
    }

    // Let the server figure out the role - hard navigate to /dashboard
    // which will redirect to the correct portal based on role
    window.location.href = redirectTo ?? "/dashboard";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div
        className="w-full max-w-sm rounded bg-white p-8"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div className="mb-6 text-center flex flex-col items-center">
          <Image
            src="/images/sahyadrilogo1.png"
            alt="Sahyadri Logo"
            width={44}
            height={44}
            className="h-11 w-auto object-contain mb-2.5"
            priority
          />
          <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>AcadeX</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to your account</p>
        </div>

        {error && (
          <p
            id="login-error"
            role="alert"
            className="mb-4 rounded px-3 py-2 text-sm text-red-700"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? "login-error" : undefined}
              className="mt-1 block w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #d1d5db" }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #d1d5db" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-disabled={isLoading}
            className="mt-2 rounded px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          <a href="/forgot-password" style={{ color: "#1e3a5f" }}>Forgot your password?</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading…</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
