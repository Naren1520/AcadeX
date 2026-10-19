"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { EmptyState } from "@/components/feedback/Skeleton";
import { IconArrowRight } from "@/components/ui/Icon";
import { SDG_LIST } from "@/lib/constants/sdgs";
import { formatDateTime } from "@/lib/dates";

interface Props {
  teamId: string | null;
  teamStatus: string | null;
  proposals: Record<string, unknown>[];
  facultyList: { id: string; full_name: string }[];
}

type ProposalStatus = "pending" | "approved" | "rejected" | "revision_requested";

const statusVariant: Record<ProposalStatus, "pending" | "approved" | "rejected" | "revision"> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  revision_requested: "revision",
};

export function StudentProposalsClient({ teamId, teamStatus, proposals, facultyList }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleSdg(n: number) {
    setSelectedSdgs((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSdgs.length === 0) { setError("Select at least one SDG."); return; }
    setIsSubmitting(true); setError(null);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, faculty_id: facultyId, title, description, sdg_numbers: selectedSdgs }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to submit proposal."); setIsSubmitting(false); return; }
    window.location.reload();
  }

  const canSubmit = teamStatus === "confirmed";
  const hasActiveProposal = proposals.some((p) =>
    p.status === "pending" || p.status === "revision_requested"
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Action bar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-500">
          {canSubmit ? "Your team is confirmed." : "Your team must be confirmed before submitting proposals."}
        </p>
        {canSubmit && !hasActiveProposal && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            New Proposal
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Submit Proposal</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormError message={error} />
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="block w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #d1d5db" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Supervisor Faculty</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  required
                  className="block w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #d1d5db" }}
                >
                  <option value="">Select faculty…</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Sustainable Development Goals ({selectedSdgs.length} selected)
                </p>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {SDG_LIST.map((sdg) => (
                    <label key={sdg.number} className="flex items-center gap-2 cursor-pointer rounded p-2 text-xs"
                      style={{ border: selectedSdgs.includes(sdg.number) ? "1px solid #1e3a5f" : "1px solid #e5e7eb",
                               backgroundColor: selectedSdgs.includes(sdg.number) ? "#f0f7ff" : "#ffffff" }}>
                      <input
                        type="checkbox"
                        checked={selectedSdgs.includes(sdg.number)}
                        onChange={() => toggleSdg(sdg.number)}
                        className="accent-navy"
                      />
                      <span>{sdg.number}. {sdg.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Proposals list */}
      {proposals.length === 0 ? (
        <EmptyState title="No proposals yet" description="Submit your first project proposal." />
      ) : (
        <ul className="flex flex-col gap-3">
          {proposals.map((p) => {
            const status = String(p.status) as ProposalStatus;
            const sdgs = (p.proposal_sdgs as { sdg_number: number }[] | undefined) ?? [];
            return (
              <li key={String(p.id)} className="rounded p-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">{String(p.title)}</h3>
                      <Badge variant={statusVariant[status]}>{status.replace("_", " ")}</Badge>
                      <span className="text-xs text-neutral-400">v{String(p.version)}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">{String(p.description).slice(0, 120)}…</p>
                    {sdgs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {sdgs.map((s) => (
                          <span key={s.sdg_number} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                            SDG {s.sdg_number}
                          </span>
                        ))}
                      </div>
                    )}
                    {!!p.rejection_reason && (
                      <p className="mt-2 text-xs text-red-600">Rejection: {String(p.rejection_reason)}</p>
                    )}
                    {!!p.revision_notes && (
                      <p className="mt-2 text-xs text-orange-600">Revision notes: {String(p.revision_notes)}</p>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400">{formatDateTime(String(p.submitted_at))}</span>
                </div>
                {status === "revision_requested" && (
                  <div className="mt-3">
                    <a
                      href={`/portal/student/proposals/${String(p.id)}/resubmit`}
                      className="inline-flex items-center gap-1 text-sm font-medium"
                      style={{ color: "#1e3a5f" }}
                    >
                      Resubmit
                      <IconArrowRight size={14} />
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
