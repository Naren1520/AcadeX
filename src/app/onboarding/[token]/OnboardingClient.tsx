"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { IconCheck, IconAlertCircle, IconUsers } from "@/components/ui/Icon";

// ── Types 
interface InvitationInfo {
  label: string;
  section: string;
  department: string;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
  is_full: boolean;
}

type Step = "loading" | "info" | "verify" | "form" | "success" | "error";

// ── Helper 
function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Main ─
export function OnboardingClient({ token }: { token: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Step 1: Passcode
  const [passcode, setPasscode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  // Step 2: Form
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", usn: "", cgpa: "",
    github_url: "", skills: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Load invitation info 
  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then((r) => r.json())
      .then((d: { invitation?: InvitationInfo; error?: string }) => {
        if (d.invitation) { setInvitation(d.invitation); setStep("info"); }
        else { setErrorMsg(d.error ?? "Invitation not found."); setStep("error"); }
      })
      .catch(() => { setErrorMsg("Unable to load invitation."); setStep("error"); });
  }, [token]);

  // Countdown for rate-limit cooldown
  useEffect(() => {
    if (retryAfter <= 0) return;
    const t = setInterval(() => setRetryAfter((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [retryAfter]);

  // ── Verify passcode 
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyLoading(true); setVerifyError(null);
    const res = await fetch(`/api/onboarding/${token}/verify`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json() as { sessionToken?: string; expiresAt?: number; error?: string };
    if (res.status === 429) {
      const ra = parseInt(res.headers.get("Retry-After") ?? "60");
      setRetryAfter(ra);
      setVerifyError(`Too many attempts. Try again in ${ra} seconds.`);
    } else if (!res.ok) {
      setVerifyError(data.error ?? "Invalid passcode.");
    } else {
      setSessionToken(data.sessionToken!);
      setStep("form");
    }
    setVerifyLoading(false);
  }

  // ── Submit form 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true); setFormError(null);

    const skills = form.skills
      .split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);

    const res = await fetch(`/api/onboarding/${token}/submit`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        usn: form.usn.trim().toUpperCase(),
        cgpa: parseFloat(form.cgpa),
        github_url: form.github_url.trim() || undefined,
        skills,
      }),
    });
    const data = await res.json() as { success?: boolean; error?: string; fields?: Record<string, string> };

    if (!res.ok) {
      if (res.status === 401) {
        setFormError(data.error ?? "Session expired. Please go back and verify your passcode again.");
        setStep("verify"); setSessionToken(null);
      } else {
        setFormError(data.error ?? "Submission failed. Please try again.");
      }
    } else {
      setStep("success");
    }
    setFormLoading(false);
  }

  // ── Render 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#f0f4f8" }}>

      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>AcadeX</p>
        <p className="text-sm text-neutral-500">Student Onboarding Portal</p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg" style={{ border: "1px solid #e5e7eb" }}>

        {/* ── Loading ── */}
        {step === "loading" && (
          <div className="py-10 text-center text-sm text-neutral-400">Loading invitation…</div>
        )}

        {/* ── Error ── */}
        {step === "error" && (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <IconAlertCircle size={40} style={{ color: "#dc2626" }} />
            </div>
            <p className="font-semibold text-neutral-800">Invitation Unavailable</p>
            <p className="mt-2 text-sm text-neutral-500">{errorMsg}</p>
          </div>
        )}

        {/* ── Info ── */}
        {step === "info" && invitation && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#eff6ff" }}>
                <IconUsers size={22} style={{ color: "#1e3a5f" }} />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{invitation.label}</p>
                <p className="text-xs text-neutral-500">{invitation.department} · Section {invitation.section}</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl p-4 text-sm"
              style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Opens</span>
                <span className="font-medium">{fmt(invitation.opens_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Closes</span>
                <span className="font-medium">{fmt(invitation.closes_at)}</span>
              </div>
            </div>

            {invitation.is_full && (
              <div className="mb-4 rounded-lg p-3 text-sm" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                This invitation has reached its maximum registrations.
              </div>
            )}
            {!invitation.is_open && !invitation.is_full && (
              <div className="mb-4 rounded-lg p-3 text-sm" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
                This invitation is currently closed.
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              disabled={!invitation.is_open || invitation.is_full}
              onClick={() => setStep("verify")}
            >
              Continue to Register
            </Button>
          </div>
        )}

        {/* ── Verify passcode ── */}
        {step === "verify" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-neutral-900">Enter Passcode</h2>
            <p className="mb-6 text-sm text-neutral-500">
              Your faculty member should have shared a passcode with this link.
            </p>
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <FormError message={verifyError} />
              <Input
                label="Passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                placeholder="Enter the passcode"
                autoComplete="off"
              />
              {retryAfter > 0 && (
                <p className="text-xs" style={{ color: "#d97706" }}>
                  Wait {retryAfter}s before retrying.
                </p>
              )}
              <Button
                variant="primary"
                type="submit"
                isLoading={verifyLoading}
                disabled={retryAfter > 0}
                className="w-full"
              >
                Verify Passcode
              </Button>
              <button type="button" onClick={() => setStep("info")}
                className="cursor-pointer text-xs text-neutral-400 underline hover:text-neutral-600">
                Back
              </button>
            </form>
          </div>
        )}

        {/* ── Details form ── */}
        {step === "form" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-neutral-900">Your Details</h2>
            <p className="mb-6 text-sm text-neutral-500">
              Fill in your information. Your faculty will review and approve your registration.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormError message={formError} />

              <Input label="Full Name" value={form.full_name} required placeholder="John Doe"
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />

              <Input label="College Email" type="email" value={form.email} required
                placeholder="yourname@college.edu"
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />

              <Input label="Password" type="password" value={form.password ?? ""} required
                placeholder="Min. 8 characters - you will use this to login"
                hint="Choose a strong password. You can change it after logging in."
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />

              <Input label="USN (10 alphanumeric characters)" value={form.usn} required
                placeholder="1CS21CS001" maxLength={10}
                onChange={(e) => setForm((p) => ({ ...p, usn: e.target.value.toUpperCase() }))} />

              <Input label="CGPA (0.00 – 10.00)" type="number" value={form.cgpa} required
                placeholder="8.50" min={0} max={10} step={0.01}
                onChange={(e) => setForm((p) => ({ ...p, cgpa: e.target.value }))} />

              <Input label="GitHub URL (optional)" type="url" value={form.github_url}
                placeholder="https://github.com/username"
                onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">
                  Skills (optional, comma-separated)
                </label>
                <input
                  value={form.skills}
                  onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
                  placeholder="React, Python, Machine Learning"
                  className="rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #d1d5db" }}
                />
                <p className="text-xs text-neutral-400">Max 20 skills, 50 chars each</p>
              </div>

              <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-neutral-500">
                  Your submission will be reviewed by your faculty before your account is created.
                  You will receive login credentials after approval.
                </p>
              </div>

              <Button variant="primary" type="submit" isLoading={formLoading} className="w-full">
                Submit Registration
              </Button>
            </form>
          </div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "#f0fdf4" }}>
                <IconCheck size={32} style={{ color: "#16a34a" }} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Registration Submitted!</h2>
            <p className="mt-3 text-sm text-neutral-500">
              Your details have been submitted successfully.
              Your faculty will review your request and you will receive your login
              credentials via email once approved.
            </p>
            <p className="mt-4 text-xs text-neutral-400">You can close this tab.</p>
          </div>
        )}

      </div>
    </div>
  );
}
