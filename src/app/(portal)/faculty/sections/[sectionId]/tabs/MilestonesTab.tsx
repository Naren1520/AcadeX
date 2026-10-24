"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { Milestone } from "../page";

const statusVariant: Record<Milestone["status"], "pending" | "approved" | "rejected"> = {
  open: "pending", completed: "approved", missed: "rejected",
};

interface Props {
  initialMilestones: Milestone[];
  approvedProposals: { id: string; title: string }[];
}

export function MilestonesTab({ initialMilestones, approvedProposals }: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [showAdd, setShowAdd]       = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState({ proposal_id: "", name: "", description: "", deadline: "" });
  const [editDeadline, setEditDeadline] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  function f(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/milestones", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deadline: new Date(form.deadline).toISOString() }),
    });
    const data = await res.json() as { milestone?: Milestone; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }
    setMilestones((p) => [...p, data.milestone!].sort((a, b) =>
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    ));
    setShowAdd(false); setLoading(false);
  }

  async function handleUpdateDeadline(id: string) {
    setLoading(true); setError(null);
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline: new Date(editDeadline).toISOString() }),
    });
    const data = await res.json() as { milestone?: Milestone; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }
    setMilestones((p) => p.map((m) => m.id === id ? data.milestone! : m));
    setEditingId(null); setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {approvedProposals.length === 0 && (
          <p className="text-sm text-neutral-500">Approve a proposal first to create milestones.</p>
        )}
        <div className="ml-auto">
          <Button variant="primary" size="sm" disabled={approvedProposals.length === 0}
            onClick={() => setShowAdd(true)}>
            Add Milestone
          </Button>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          No milestones yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((m) => (
            <div key={m.id} className="rounded-xl p-5"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{m.name}</h3>
                    <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                  </div>
                  {m.proposals && (
                    <p className="text-xs text-neutral-500 mb-1">Proposal: {m.proposals.title}</p>
                  )}
                  {m.description && (
                    <p className="text-sm text-neutral-600">{m.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-neutral-400">Deadline</p>
                  <p className="text-sm font-medium text-neutral-700">
                    {new Date(m.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(m.deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              {m.status === "open" && (
                <div className="mt-3">
                  <Button variant="ghost" size="sm"
                    onClick={() => { setEditingId(m.id); setEditDeadline(""); setError(null); }}>
                    Edit Deadline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd} title="Add Milestone">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">Proposal <span className="text-red-500">*</span></label>
            <select value={form.proposal_id} onChange={(e) => f("proposal_id", e.target.value)} required
              className="cursor-pointer rounded px-3 py-2 text-sm"
              style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }}>
              <option value="">Select approved proposal…</option>
              {approvedProposals.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <Input label="Name" value={form.name} onChange={(e) => f("name", e.target.value)} required maxLength={100} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
              rows={2} maxLength={500} className="rounded px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #d1d5db" }} />
          </div>
          <Input label="Deadline" type="datetime-local" value={form.deadline}
            onChange={(e) => f("deadline", e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={loading}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit deadline dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) setEditingId(null); }} title="Update Deadline">
        <div className="flex flex-col gap-4">
          <FormError message={error} />
          <Input label="New Deadline" type="datetime-local" value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button variant="primary" isLoading={loading}
              onClick={() => editingId && handleUpdateDeadline(editingId)}>
              Update
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
