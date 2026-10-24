"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormError } from "@/components/forms/FormError";
import { EmptyState } from "@/components/feedback/Skeleton";
import type { Proposal } from "../page";

type Status = "pending" | "approved" | "rejected" | "revision_requested";

const statusVariant: Record<Status, "pending" | "approved" | "rejected" | "revision"> = {
  pending: "pending", approved: "approved", rejected: "rejected", revision_requested: "revision",
};

const filters = ["all", "pending", "approved", "rejected", "revision_requested"] as const;

interface Props { initialProposals: Proposal[] }

export function ProposalsTab({ initialProposals }: Props) {
  const [proposals, setProposals] = useState(initialProposals);
  const [filter, setFilter]       = useState<string>("all");
  const [modal, setModal]         = useState<{ id: string; type: "reject" | "revision" } | null>(null);
  const [notes, setNotes]         = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(id: string, status: string) {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status: status as Status } : p));
  }

  async function approve(id: string) {
    if (!confirm("Approve this proposal?")) return;
    const res = await fetch(`/api/proposals/${id}/approve`, { method: "PATCH" });
    if (res.ok) update(id, "approved");
  }

  async function handleModalSubmit() {
    if (!modal) return;
    if (notes.trim().length < 10) { setNotesError("Must be at least 10 characters."); return; }
    setSubmitting(true); setNotesError(null);
    const endpoint = modal.type === "reject"
      ? `/api/proposals/${modal.id}/reject`
      : `/api/proposals/${modal.id}/request-revision`;
    const body = modal.type === "reject" ? { rejection_reason: notes } : { revision_notes: notes };
    const res = await fetch(endpoint, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      update(modal.id, modal.type === "reject" ? "rejected" : "revision_requested");
      setModal(null); setNotes("");
    }
    setSubmitting(false);
  }

  const visible = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f === "all" ? proposals.length : proposals.filter((p) => p.status === f).length;
          return (
            <button key={f} type="button"
              onClick={() => setFilter(f)}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? "#1e3a5f" : "#f3f4f6",
                color:           filter === f ? "#fff"    : "#374151",
                border:          "1px solid transparent",
              }}>
              {f === "all" ? "All" : f.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No proposals" description="Proposals from students in this section will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((p) => (
            <div key={p.id} className="rounded-xl p-5"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{p.title}</h3>
                    <Badge variant={statusVariant[p.status]}>{p.status.replace("_", " ")}</Badge>
                    <span className="text-xs text-neutral-400">v{p.version}</span>
                  </div>
                  {p.teams && <p className="mb-2 text-xs text-neutral-500">Team: {p.teams.name}</p>}
                  <p className="text-sm text-neutral-600">
                    {p.description.slice(0, 180)}{p.description.length > 180 ? "…" : ""}
                  </p>
                  {p.proposal_sdgs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.proposal_sdgs.map((s) => (
                        <span key={s.sdg_number} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                          SDG {s.sdg_number}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap">
                  {new Date(p.submitted_at).toLocaleDateString()}
                </span>
              </div>

              {p.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" onClick={() => approve(p.id)}>Approve</Button>
                  <Button variant="secondary" size="sm"
                    onClick={() => { setModal({ id: p.id, type: "revision" }); setNotes(""); }}>
                    Request Revision
                  </Button>
                  <Button variant="destructive" size="sm"
                    onClick={() => { setModal({ id: p.id, type: "reject" }); setNotes(""); }}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!modal}
        onOpenChange={(o) => { if (!o) setModal(null); }}
        title={modal?.type === "reject" ? "Reject Proposal" : "Request Revision"}
        description="Provide notes (minimum 10 characters).">
        <div className="flex flex-col gap-3">
          <FormError message={notesError} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
            className="block w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ border: "1px solid #d1d5db" }}
            placeholder="Explain the reason or required changes…" />
          <p className="text-xs text-neutral-400">{notes.length}/10 min characters</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant={modal?.type === "reject" ? "destructive" : "primary"}
              isLoading={submitting} onClick={handleModalSubmit}>
              {modal?.type === "reject" ? "Reject" : "Request Revision"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
