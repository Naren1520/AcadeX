"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { SubmissionWindow } from "../page";

function isOpen(opens: string, closes: string) {
  const now = Date.now();
  return now >= new Date(opens).getTime() && now <= new Date(closes).getTime();
}

function fmtDT(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  initialWindows: SubmissionWindow[];
  openMilestones: { id: string; name: string }[];
}

export function SubmissionWindowsTab({ initialWindows, openMilestones }: Props) {
  const [windows, setWindows] = useState(initialWindows);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ milestone_id: "", opens_at: "", closes_at: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function f(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/submission-windows", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestone_id: form.milestone_id,
        opens_at: new Date(form.opens_at).toISOString(),
        closes_at: new Date(form.closes_at).toISOString(),
      }),
    });
    const data = await res.json() as { window?: SubmissionWindow; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }
    setWindows((p) => [data.window!, ...p]);
    setShowAdd(false); setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {openMilestones.length === 0 && (
          <p className="text-sm text-neutral-500">No open milestones available. Create a milestone first.</p>
        )}
        <div className="ml-auto">
          <Button variant="primary" size="sm" disabled={openMilestones.length === 0}
            onClick={() => setShowAdd(true)}>
            Create Window
          </Button>
        </div>
      </div>

      {windows.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          No submission windows yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {windows.map((w) => {
            const open = isOpen(w.opens_at, w.closes_at);
            return (
              <div key={w.id} className="rounded-xl p-5"
                style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900">{w.milestones?.name ?? "-"}</p>
                      <Badge variant={open ? "approved" : "neutral"}>{open ? "Open" : "Closed"}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-neutral-500">
                      <span className="text-neutral-400">Opens</span>
                      <span className="text-neutral-400">Closes</span>
                      <span className="font-medium text-neutral-700">{fmtDT(w.opens_at)}</span>
                      <span className="font-medium text-neutral-700">{fmtDT(w.closes_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd} title="Create Submission Window">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">Milestone <span className="text-red-500">*</span></label>
            <select value={form.milestone_id} onChange={(e) => f("milestone_id", e.target.value)} required
              className="cursor-pointer rounded px-3 py-2 text-sm"
              style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }}>
              <option value="">Select open milestone…</option>
              {openMilestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <Input label="Opens At" type="datetime-local" value={form.opens_at}
            onChange={(e) => f("opens_at", e.target.value)} required />
          <Input label="Closes At" type="datetime-local" value={form.closes_at}
            onChange={(e) => f("closes_at", e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={loading}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
