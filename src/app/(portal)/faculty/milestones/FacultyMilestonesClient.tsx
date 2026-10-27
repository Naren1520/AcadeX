"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { formatDate } from "@/lib/dates";

interface Milestone {
  id: string; name: string; description: string; deadline: string;
  status: "open" | "completed" | "missed"; proposal_id: string;
  proposals?: { title: string };
}

interface Props {
  milestones: Record<string, unknown>[];
  proposals: { id: string; title: string }[];
}

export function FacultyMilestonesClient({ milestones: initial, proposals }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>(initial as unknown as Milestone[]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ proposal_id: "", name: "", description: "", deadline: "" });
  const [editDeadline, setEditDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/milestones", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deadline: new Date(form.deadline).toISOString() }),
    });
    const data = await res.json() as { milestone?: Milestone; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create milestone."); setIsLoading(false); return; }
    setMilestones((p) => [...p, data.milestone!].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
    setShowCreate(false); setIsLoading(false);
  }

  async function handleUpdateDeadline(id: string) {
    setIsLoading(true); setError(null);
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline: new Date(editDeadline).toISOString() }),
    });
    const data = await res.json() as { milestone?: Milestone; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to update deadline."); setIsLoading(false); return; }
    setMilestones((p) => p.map((m) => m.id === id ? data.milestone! : m));
    setEditingId(null); setIsLoading(false);
  }

  const statusVariant = { open: "pending" as const, completed: "approved" as const, missed: "rejected" as const };

  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "proposal", header: "Proposal", render: (m: Milestone) => String((m.proposals as { title: string } | undefined)?.title ?? "-") },
    { key: "deadline", header: "Deadline", sortable: true, render: (m: Milestone) => formatDate(m.deadline) },
    { key: "status", header: "Status", render: (m: Milestone) => <Badge variant={statusVariant[m.status]}>{m.status}</Badge> },
    {
      key: "actions", header: "", render: (m: Milestone) => (
        m.status === "open" ? (
          <Button variant="ghost" size="sm" onClick={() => { setEditingId(m.id); setEditDeadline(""); setError(null); }}>
            Edit Deadline
          </Button>
        ) : null
      )
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} disabled={proposals.length === 0}>
          Add Milestone
        </Button>
      </div>
      {proposals.length === 0 && (
        <p className="mb-4 text-sm text-neutral-500">No approved proposals yet. Approve a proposal first.</p>
      )}
      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={milestones} emptyMessage="No milestones yet." caption="Milestones" />
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Milestone">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Proposal</label>
            <select value={form.proposal_id} onChange={(e) => setForm((p) => ({ ...p, proposal_id: e.target.value }))} required
              className="block w-full rounded px-3 py-2 text-sm" style={{ border: "1px solid #d1d5db" }}>
              <option value="">Select proposal…</option>
              {proposals.map((pr) => <option key={pr.id} value={pr.id}>{pr.title}</option>)}
            </select>
          </div>
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required maxLength={100} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3} maxLength={500} className="block w-full rounded px-3 py-2 text-sm" style={{ border: "1px solid #d1d5db" }} />
          </div>
          <Input label="Deadline" type="datetime-local" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} required />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit deadline dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) setEditingId(null); }} title="Update Deadline">
        <div className="flex flex-col gap-4">
          <FormError message={error} />
          <Input label="New Deadline" type="datetime-local" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button variant="primary" isLoading={isLoading} onClick={() => editingId && handleUpdateDeadline(editingId)}>Update</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
