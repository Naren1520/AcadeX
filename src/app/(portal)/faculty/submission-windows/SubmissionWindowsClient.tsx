"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { isWindowOpen, formatDateTime } from "@/lib/dates";

interface Window_ { id: string; milestone_id: string; opens_at: string; closes_at: string; milestones?: { name: string }; }
interface Props { windows: Record<string, unknown>[]; milestones: { id: string; name: string }[]; }

export function SubmissionWindowsClient({ windows: initial, milestones }: Props) {
  const [windows, setWindows] = useState<Window_[]>(initial as unknown as Window_[]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ milestone_id: "", opens_at: "", closes_at: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const body = {
      milestone_id: form.milestone_id,
      opens_at: new Date(form.opens_at).toISOString(),
      closes_at: new Date(form.closes_at).toISOString(),
    };
    const res = await fetch("/api/submission-windows", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { window?: Window_; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create window."); setIsLoading(false); return; }
    setWindows((p) => [data.window!, ...p]);
    setShowCreate(false); setIsLoading(false);
  }

  const columns = [
    { key: "milestone", header: "Milestone", render: (w: Window_) => String(w.milestones?.name ?? "-") },
    { key: "opens_at", header: "Opens", render: (w: Window_) => formatDateTime(w.opens_at) },
    { key: "closes_at", header: "Closes", render: (w: Window_) => formatDateTime(w.closes_at) },
    {
      key: "status", header: "Status", render: (w: Window_) => {
        const open = isWindowOpen(new Date(w.opens_at), new Date(w.closes_at));
        return <Badge variant={open ? "approved" : "neutral"}>{open ? "Open" : "Closed"}</Badge>;
      }
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} disabled={milestones.length === 0}>
          Create Window
        </Button>
      </div>
      {milestones.length === 0 && (
        <p className="mb-4 text-sm text-neutral-500">No open milestones. Create a milestone first.</p>
      )}
      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={windows} emptyMessage="No submission windows yet." caption="Submission windows" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Submission Window">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Milestone</label>
            <select value={form.milestone_id} onChange={(e) => setForm((p) => ({ ...p, milestone_id: e.target.value }))} required
              className="block w-full rounded px-3 py-2 text-sm" style={{ border: "1px solid #d1d5db" }}>
              <option value="">Select milestone…</option>
              {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <Input label="Opens At" type="datetime-local" value={form.opens_at} onChange={(e) => setForm((p) => ({ ...p, opens_at: e.target.value }))} required />
          <Input label="Closes At" type="datetime-local" value={form.closes_at} onChange={(e) => setForm((p) => ({ ...p, closes_at: e.target.value }))} required />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
