"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormError } from "@/components/forms/FormError";
import { EmptyState } from "@/components/feedback/Skeleton";
import { formatDateTime } from "@/lib/dates";

type ProposalStatus = "pending" | "approved" | "rejected" | "revision_requested";
const statusVariant: Record<ProposalStatus, "pending" | "approved" | "rejected" | "revision"> = {
  pending: "pending", approved: "approved", rejected: "rejected", revision_requested: "revision",
};

interface Props { proposals: Record<string, unknown>[]; }

export function FacultyProposalsClient({ proposals: initialProposals }: Props) {
  const [proposals, setProposals] = useState(initialProposals);
  const [actionModal, setActionModal] = useState<{ id: string; type: "reject" | "revision" } | null>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  async function approve(id: string) {
    if (!confirm("Approve this proposal?")) return;
    const res = await fetch(`/api/proposals/${id}/approve`, { method: "PATCH" });
    if (res.ok) updateProposalStatus(id, "approved");
  }

  async function handleModalSubmit() {
    if (!actionModal) return;
    if (notes.trim().length < 10) { setNotesError("Must be at least 10 characters."); return; }
    setIsSubmitting(true); setNotesError(null);
    const endpoint = actionModal.type === "reject"
      ? `/api/proposals/${actionModal.id}/reject`
      : `/api/proposals/${actionModal.id}/request-revision`;
    const body = actionModal.type === "reject"
      ? { rejection_reason: notes }
      : { revision_notes: notes };
    const res = await fetch(endpoint, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      updateProposalStatus(actionModal.id, actionModal.type === "reject" ? "rejected" : "revision_requested");
      setActionModal(null); setNotes("");
    }
    setIsSubmitting(false);
  }

  function updateProposalStatus(id: string, status: string) {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  const filtered = filterStatus === "all"
    ? proposals
    : proposals.filter((p) => p.status === filterStatus);

  return (
    <div>
      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected", "revision_requested"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: filterStatus === s ? "#1e3a5f" : "#ffffff",
              color: filterStatus === s ? "#ffffff" : "#374151",
              border: "1px solid #e5e7eb",
            }}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No proposals" description="Proposals assigned to you will appear here." />
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((p) => {
            const status = String(p.status) as ProposalStatus;
            const sdgs = (p.proposal_sdgs as { sdg_number: number }[] | undefined) ?? [];
            const team = p.teams as { name: string } | undefined;
            const canAct = status === "pending";

            return (
              <li key={String(p.id)} className="rounded p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900">{String(p.title)}</h3>
                      <Badge variant={statusVariant[status]}>{status.replace("_", " ")}</Badge>
                      <span className="text-xs text-neutral-500">v{String(p.version)}</span>
                    </div>
                    {team && <p className="text-xs text-neutral-500 mb-2">Team: {team.name}</p>}
                    <p className="text-sm text-neutral-600">{String(p.description).slice(0, 200)}{String(p.description).length > 200 ? "…" : ""}</p>
                    {sdgs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {sdgs.map((s) => (
                          <span key={s.sdg_number} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">SDG {s.sdg_number}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{formatDateTime(String(p.submitted_at))}</span>
                </div>

                {canAct && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" onClick={() => approve(String(p.id))}>Approve</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setActionModal({ id: String(p.id), type: "revision" }); setNotes(""); }}>Request Revision</Button>
                    <Button variant="destructive" size="sm" onClick={() => { setActionModal({ id: String(p.id), type: "reject" }); setNotes(""); }}>Reject</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!actionModal}
        onOpenChange={(o) => { if (!o) setActionModal(null); }}
        title={actionModal?.type === "reject" ? "Reject Proposal" : "Request Revision"}
        description="Provide notes (minimum 10 characters)."
      >
        <div className="flex flex-col gap-3">
          <FormError message={notesError} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="block w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ border: "1px solid #d1d5db" }}
            placeholder="Explain the reason or required changes…"
            aria-label="Notes"
          />
          <p className="text-xs text-neutral-500">{notes.length}/10 min characters</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button
              variant={actionModal?.type === "reject" ? "destructive" : "primary"}
              isLoading={isSubmitting}
              onClick={handleModalSubmit}
            >
              {actionModal?.type === "reject" ? "Reject" : "Request Revision"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
