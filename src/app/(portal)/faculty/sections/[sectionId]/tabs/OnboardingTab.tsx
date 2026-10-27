"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { IconCheck, IconAlertCircle, IconDownload } from "@/components/ui/Icon";

interface Invitation {
  id: string;
  label: string;
  opens_at: string;
  closes_at: string;
  max_uses: number;
  use_count: number;
  is_active: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  full_name: string;
  email: string;
  usn: string;
  cgpa: number;
  github_url: string | null;
  skills: string[];
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  rejection_note: string | null;
}

interface Props {
  sectionId: string;
  sectionLabel: string;
  departmentId: string;
  initialInvitations: Invitation[];
  initialSubmissions: Submission[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isOpen(inv: Invitation) {
  const now = Date.now();
  return inv.is_active
    && now >= new Date(inv.opens_at).getTime()
    && now <= new Date(inv.closes_at).getTime()
    && inv.use_count < inv.max_uses;
}

export function OnboardingTab({
  sectionId, sectionLabel, departmentId, initialInvitations, initialSubmissions,
}: Props) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [subTab, setSubTab] = useState<"invitations" | "submissions">("invitations");

  // Create invitation
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    label: `${sectionLabel} Onboarding`,
    passcode: "", opens_at: "", closes_at: "", max_uses: "100",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(invId: string, link: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(invId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Review submission
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  async function handleCreateInvitation(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true); setCreateError(null);
    const res = await fetch("/api/faculty/onboarding/invitations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: sectionId,
        department_id: departmentId,
        label: createForm.label,
        passcode: createForm.passcode,
        opens_at: new Date(createForm.opens_at).toISOString(),
        closes_at: new Date(createForm.closes_at).toISOString(),
        max_uses: parseInt(createForm.max_uses),
      }),
    });
    const data = await res.json() as { invitation?: Invitation; error?: string };
    if (!res.ok) { setCreateError(data.error ?? "Failed."); setCreateLoading(false); return; }
    setInvitations((p) => [data.invitation!, ...p]);
    const link = `${window.location.origin}/onboarding/${data.invitation!.id}`;
    setNewLink(link);
    setShowCreate(false); setCreateLoading(false);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this invitation? Students will no longer be able to use it.")) return;
    const res = await fetch(`/api/faculty/onboarding/invitations/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    if (res.ok) setInvitations((p) => p.map((i) => i.id === id ? { ...i, is_active: false } : i));
  }

  async function handleReview(action: "approve" | "reject") {
    if (!reviewing) return;
    if (action === "reject" && rejectNote.trim().length < 5) {
      setReviewError("Rejection note must be at least 5 characters."); return;
    }
    setReviewLoading(true); setReviewError(null);
    const res = await fetch(`/api/faculty/onboarding/submissions/${reviewing.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        rejection_note: action === "reject" ? rejectNote : undefined,
      }),
    });
    const data = await res.json() as { success?: boolean; status?: string; error?: string };
    if (!res.ok) { setReviewError(data.error ?? "Failed."); setReviewLoading(false); return; }

    setSubmissions((p) => p.map((s) =>
      s.id === reviewing.id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s
    ));
    setReviewing(null);
    setReviewLoading(false);
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {([
          { id: "invitations" as const, label: "Invitation Links" },
          { id: "submissions" as const, label: `Pending Reviews (${pendingCount})` },
        ]).map((t) => (
          <button key={t.id} type="button" onClick={() => setSubTab(t.id)}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: subTab === t.id ? "#1e3a5f" : "#f3f4f6",
              color: subTab === t.id ? "#fff" : "#374151",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Invitations tab ── */}
      {subTab === "invitations" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => {
              setCreateForm({ label: `${sectionLabel} Onboarding`, passcode: "", opens_at: "", closes_at: "", max_uses: "100" });
              setCreateError(null); setShowCreate(true);
            }}>
              + Create Invitation Link
            </Button>
          </div>

          {/* New link banner */}
          {newLink && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "#16a34a" }}>
                <IconCheck size={14} /> Invitation created! Share this link with students:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-auto rounded bg-white px-3 py-2 text-xs" style={{ border: "1px solid #d1d5db" }}>
                  {newLink}
                </code>
                <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(newLink); setCopiedId("banner"); setTimeout(() => setCopiedId(null), 2000); }}>
                  {copiedId === "banner" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <button type="button" onClick={() => setNewLink(null)}
                className="mt-2 cursor-pointer text-xs text-neutral-400 underline">Dismiss</button>
            </div>
          )}

          {invitations.length === 0 ? (
            <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
              style={{ border: "2px dashed #e5e7eb" }}>
              No invitation links yet. Create one to allow students to self-register.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {invitations.map((inv) => {
                const open = isOpen(inv);
                const link = `${typeof window !== "undefined" ? window.location.origin : ""}/onboarding/${inv.id}`;
                return (
                  <div key={inv.id} className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-neutral-900">{inv.label}</p>
                          <Badge variant={open ? "approved" : "neutral"}>
                            {!inv.is_active ? "Deactivated" : open ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {fmt(inv.opens_at)} → {fmt(inv.closes_at)}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {inv.use_count} / {inv.max_uses} registrations
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm"
                          onClick={() => copyLink(inv.id, link)}>
                          {copiedId === inv.id ? "Copied!" : "Copy Link"}
                        </Button>
                        {inv.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivate(inv.id)}>
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Submissions tab ── */}
      {subTab === "submissions" && (
        <div className="flex flex-col gap-3">
          {submissions.length === 0 ? (
            <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
              style={{ border: "2px dashed #e5e7eb" }}>
              No submissions yet.
            </div>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="rounded-xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900">{s.full_name}</p>
                      <Badge variant={s.status === "approved" ? "approved" : s.status === "rejected" ? "rejected" : "pending"}>
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">{s.email} · {s.usn}</p>
                    <p className="text-xs text-neutral-400">CGPA {s.cgpa.toFixed(2)} · Submitted {fmt(s.submitted_at)}</p>
                    {s.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.skills.map((sk) => (
                          <span key={sk} className="rounded bg-neutral-100 px-2 py-0.5 text-xs">{sk}</span>
                        ))}
                      </div>
                    )}
                    {s.rejection_note && (
                      <p className="mt-2 text-xs" style={{ color: "#dc2626" }}>Note: {s.rejection_note}</p>
                    )}
                  </div>
                  {s.status === "pending" && (
                    <Button variant="secondary" size="sm"
                      onClick={() => { setReviewing(s); setRejectNote(""); setReviewError(null); }}>
                      Review
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Create invitation dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Onboarding Invitation"
        description="Students will use this link to self-register. You control the time window and passcode.">
        <form onSubmit={handleCreateInvitation} className="flex flex-col gap-4">
          <FormError message={createError} />
          <Input label="Label (shown to students)" value={createForm.label}
            onChange={(e) => setCreateForm((p) => ({ ...p, label: e.target.value }))} required />
          <Input label="Passcode (share this with students)" type="password"
            value={createForm.passcode}
            onChange={(e) => setCreateForm((p) => ({ ...p, passcode: e.target.value }))}
            required placeholder="Min. 6 characters"
            hint="Students must enter this passcode to access the registration form." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Opens At" type="datetime-local" value={createForm.opens_at}
              onChange={(e) => setCreateForm((p) => ({ ...p, opens_at: e.target.value }))} required />
            <Input label="Closes At" type="datetime-local" value={createForm.closes_at}
              onChange={(e) => setCreateForm((p) => ({ ...p, closes_at: e.target.value }))} required />
          </div>
          <Input label="Max Registrations" type="number" value={createForm.max_uses}
            onChange={(e) => setCreateForm((p) => ({ ...p, max_uses: e.target.value }))}
            min={1} max={500} hint="Maximum number of students who can submit via this link." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={createLoading}>Create Link</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Review submission dialog ── */}
      <Dialog open={!!reviewing} onOpenChange={(o) => { if (!o) setReviewing(null); }}
        title={`Review - ${reviewing?.full_name ?? ""}`}
        description="Approve to create the student account or reject with a reason.">
        {reviewing && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <div className="grid gap-2 text-sm">
                {[
                  ["Name", reviewing.full_name],
                  ["Email", reviewing.email],
                  ["USN", reviewing.usn],
                  ["CGPA", reviewing.cgpa.toFixed(2)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-neutral-400">{k}</span>
                    <span className="font-medium text-neutral-800">{v}</span>
                  </div>
                ))}
                {reviewing.github_url && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">GitHub</span>
                    <a href={reviewing.github_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs" style={{ color: "#1e3a5f" }}>View →</a>
                  </div>
                )}
              </div>
              {reviewing.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {reviewing.skills.map((sk) => (
                    <span key={sk} className="rounded bg-neutral-200 px-2 py-0.5 text-xs">{sk}</span>
                  ))}
                </div>
              )}
            </div>

            <FormError message={reviewError} />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Rejection Note <span className="text-neutral-400 font-normal">(required if rejecting)</span>
              </label>
              <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                rows={3} placeholder="Reason for rejection…"
                className="rounded px-3 py-2 text-sm focus:outline-none"
                style={{ border: "1px solid #d1d5db" }} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setReviewing(null)}>Cancel</Button>
              <Button variant="destructive" type="button" isLoading={reviewLoading}
                onClick={() => handleReview("reject")}>
                Reject
              </Button>
              <Button variant="primary" type="button" isLoading={reviewLoading}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => handleReview("approve")}>
                Approve & Create Account
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
