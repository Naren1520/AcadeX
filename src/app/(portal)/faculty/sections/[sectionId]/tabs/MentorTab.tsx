"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { FormError } from "@/components/forms/FormError";

interface TeamWithMentor {
  team_id: string;
  team_name: string;
  team_status: string;
  mentor_id: string | null;
  mentor_name: string | null;
  mentor_email: string | null;
}

interface FacultyOption { id: string; full_name: string; email: string }

interface Props {
  sectionId: string;
  facultyId: string;   // current user (cannot be their own mentor)
  initialTeams: TeamWithMentor[];
  facultyList: FacultyOption[];
}

export function MentorTab({ sectionId, facultyId, initialTeams, facultyList }: Props) {
  const [teams, setTeams] = useState(initialTeams);
  const [assigning, setAssigning] = useState<TeamWithMentor | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableFaculty = facultyList;

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assigning || !selectedFaculty) return;
    setLoading(true); setError(null);

    const res = await fetch(`/api/faculty/teams/${assigning.team_id}/mentor`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentor_id: selectedFaculty, notes: notes || undefined }),
    });
    const data = await res.json() as { mentor?: { full_name: string }; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }

    const fac = facultyList.find((f) => f.id === selectedFaculty)!;
    setTeams((prev) => prev.map((t) =>
      t.team_id === assigning.team_id
        ? { ...t, mentor_id: selectedFaculty, mentor_name: fac.full_name, mentor_email: fac.email }
        : t
    ));
    setAssigning(null); setSelectedFaculty(""); setNotes(""); setLoading(false);
  }

  async function handleRemove(teamId: string, mentorName: string) {
    if (!confirm(`Remove ${mentorName} as mentor from this team?`)) return;
    const res = await fetch(`/api/faculty/teams/${teamId}/mentor`, { method: "DELETE" });
    if (res.ok) {
      setTeams((prev) => prev.map((t) =>
        t.team_id === teamId ? { ...t, mentor_id: null, mentor_name: null, mentor_email: null } : t
      ));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">
        Assign a project mentor (another faculty) to each team. The mentor gets read-only
        visibility into the team&apos;s full progress.
      </p>

      {teams.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          No teams in this section yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {teams.map((t) => {
            const status = t.team_status as "forming" | "confirmed" | "dissolved";
            return (
              <div key={t.team_id} className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-neutral-900">{t.team_name}</p>
                    <Badge variant={status}>{status}</Badge>
                  </div>
                  {t.mentor_id ? (
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg px-3 py-1 text-xs"
                        style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                        Mentor: <strong>{t.mentor_name}</strong>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(t.team_id, t.mentor_name!)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button variant="secondary" size="sm"
                      disabled={availableFaculty.length === 0}
                      onClick={() => { setAssigning(t); setSelectedFaculty(""); setNotes(""); setError(null); }}>
                      Assign Mentor
                    </Button>
                  )}
                </div>
                {!t.mentor_id && (
                  <div className="px-5 py-2">
                    <p className="text-xs text-neutral-400 italic">No mentor assigned yet.</p>
                  </div>
                )}
                {t.mentor_id && t.mentor_email && (
                  <div className="px-5 py-2">
                    <p className="text-xs text-neutral-500">{t.mentor_email}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!assigning} onOpenChange={(o) => { if (!o) setAssigning(null); }}
        title={`Assign Mentor - ${assigning?.team_name ?? ""}`}
        description="Select a faculty member to mentor this team. They will have read-only access to all team activity.">
        <form onSubmit={handleAssign} className="flex flex-col gap-4">
          <FormError message={error} />
          <Select
            label="Faculty Mentor"
            value={selectedFaculty}
            onValueChange={setSelectedFaculty}
            options={availableFaculty.map((f) => ({ value: f.id, label: `${f.full_name} (${f.email})` }))}
            placeholder="Select faculty…"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">Notes <span className="font-normal text-neutral-400">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500}
              placeholder="Any specific guidance for the mentor…"
              className="rounded px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #d1d5db" }} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setAssigning(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={loading} disabled={!selectedFaculty}>
              Assign Mentor
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
