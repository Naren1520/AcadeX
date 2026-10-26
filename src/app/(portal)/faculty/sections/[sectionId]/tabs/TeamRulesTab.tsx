"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { IconTrash } from "@/components/ui/Icon";

interface Slot {
  cgpa_lower: number;
  cgpa_upper: number;
  count: number;
  label: string;
}

interface Rule {
  id: string;
  label: string;
  team_size: number;
  max_teams: number;
  formed_count: number;
  is_enabled: boolean;
  section_id: string;
  team_formation_slots: Slot[];
  // legacy (ignored in new UI)
  cgpa_lower?: number;
  cgpa_upper?: number;
  min_team_size?: number;
  max_team_size?: number;
}

interface Props {
  sectionId: string;
  initialRules: Rule[];
  teamCountByRule: Record<string, number>; // real count from teams table
}

const emptySlot = (): Slot => ({ cgpa_lower: 0, cgpa_upper: 10, count: 1, label: "" });

export function TeamRulesTab({ sectionId, initialRules, teamCountByRule }: Props) {
  const [rules, setRules]     = useState<Rule[]>(initialRules);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [label, setLabel]       = useState("Rule");
  const [teamSize, setTeamSize] = useState("4");
  const [maxTeams, setMaxTeams] = useState("5");
  const [slots, setSlots]       = useState<Slot[]>([emptySlot()]);

  function resetForm() {
    setLabel("Rule"); setTeamSize("4"); setMaxTeams("5");
    setSlots([emptySlot()]); setError(null);
  }

  function addSlot() {
    setSlots((p) => [...p, emptySlot()]);
  }

  function removeSlot(i: number) {
    setSlots((p) => p.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, field: keyof Slot, value: string) {
    setSlots((p) => p.map((s, idx) =>
      idx === i
        ? { ...s, [field]: field === "label" ? value : parseFloat(value) || 0 }
        : s
    ));
  }

  function updateSlotCount(i: number, value: string) {
    setSlots((p) => p.map((s, idx) =>
      idx === i ? { ...s, count: parseInt(value) || 1 } : s
    ));
  }

  // Live validation
  const sizeNum   = parseInt(teamSize) || 0;
  const slotTotal = slots.reduce((sum, s) => sum + s.count, 0);
  const slotMismatch = sizeNum > 0 && slotTotal !== sizeNum;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (slotMismatch) { setError(`Slot counts sum to ${slotTotal} but team size is ${sizeNum}. They must be equal.`); return; }
    setLoading(true); setError(null);
    const res = await fetch("/api/team-formation/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: sectionId,
        label,
        team_size:  sizeNum,
        max_teams:  parseInt(maxTeams) || 1,
        slots: slots.map((s) => ({
          cgpa_lower: s.cgpa_lower,
          cgpa_upper: s.cgpa_upper,
          count:      s.count,
          label:      s.label,
        })),
      }),
    });
    const data = await res.json() as { rule?: Rule; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }
    setRules((p) => [data.rule!, ...p]);
    setShowAdd(false); resetForm(); setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule? Teams already formed will not be affected.")) return;
    const res = await fetch(`/api/team-formation/rules/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json() as { soft?: boolean };
      if (data.soft) setRules((p) => p.map((r) => r.id === id ? { ...r, is_enabled: false } : r));
      else            setRules((p) => p.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          No rules yet. Add one to define how students can form teams.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((r) => (
            <div key={r.id} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #e5e7eb", backgroundColor: r.is_enabled ? "#fff" : "#f9fafb" }}>

              {/* Rule header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-neutral-900">{r.label}</p>
                  <Badge variant={r.is_enabled ? "approved" : "neutral"}>
                    {r.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                  <span className="text-xs text-neutral-500">
                    Team size: <strong>{r.team_size}</strong>
                  </span>
                  <span className="text-xs text-neutral-500">
                    Max teams: <strong>{r.max_teams}</strong>
                  </span>
                  <span className="text-xs font-medium" style={{
                    color: (teamCountByRule[r.id] ?? r.formed_count) >= r.max_teams ? "#dc2626" : "#16a34a"
                  }}>
                    {teamCountByRule[r.id] ?? r.formed_count}/{r.max_teams} formed
                  </span>
                  {(teamCountByRule[r.id] ?? r.formed_count) >= r.max_teams && (
                    <Badge variant="rejected">Quota full</Badge>
                  )}
                </div>
                {r.is_enabled && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                    <IconTrash size={13} /> Delete
                  </Button>
                )}
              </div>

              {/* Slots */}
              <div className="px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Team Composition
                </p>
                <div className="flex flex-wrap gap-2">
                  {(r.team_formation_slots ?? []).map((s, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <span className="font-semibold" style={{ color: "#1e3a5f" }}>
                        {s.count} member{s.count !== 1 ? "s" : ""}
                      </span>
                      <span className="ml-1 text-neutral-500">
                        CGPA {s.cgpa_lower}–{s.cgpa_upper}
                        {s.label ? ` (${s.label})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Rule Dialog ── */}
      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) setShowAdd(false); }}
        title="New Team Formation Rule" size="lg"
        description="Define how many students from each CGPA band must be in a team.">
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <FormError message={error} />

          {/* Rule meta */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Input label="Rule Label" value={label}
                onChange={(e) => setLabel(e.target.value)} required placeholder="Mixed A" />
            </div>
            <Input label="Team Size (exact)" type="number" min="1" value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)} required />
            <Input label="Max Teams Allowed" type="number" min="1" value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value)} required />
          </div>

          {/* Slots */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-700">
                CGPA Bands
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  (slot counts must sum to team size = {teamSize})
                </span>
              </p>
              <Button variant="secondary" size="sm" type="button" onClick={addSlot}>
                + Add Band
              </Button>
            </div>

            {/* Slot total indicator */}
            <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${slotMismatch ? "text-red-600" : "text-green-700"}`}
              style={{ backgroundColor: slotMismatch ? "#fef2f2" : "#f0fdf4", border: `1px solid ${slotMismatch ? "#fecaca" : "#bbf7d0"}` }}>
              Slot counts sum: <strong>{slotTotal}</strong> / needed: <strong>{teamSize}</strong>
              {!slotMismatch && sizeNum > 0 && " ✓"}
            </div>

            <div className="flex flex-col gap-3">
              {slots.map((s, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-500">Band {i + 1}</p>
                    {slots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(i)}
                        className="cursor-pointer text-xs text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Input label="CGPA Lower" type="number" step="0.01" min="0" max="10"
                      value={String(s.cgpa_lower)}
                      onChange={(e) => updateSlot(i, "cgpa_lower", e.target.value)} />
                    <Input label="CGPA Upper" type="number" step="0.01" min="0" max="10"
                      value={String(s.cgpa_upper)}
                      onChange={(e) => updateSlot(i, "cgpa_upper", e.target.value)} />
                    <Input label="# Members" type="number" min="1"
                      value={String(s.count)}
                      onChange={(e) => updateSlotCount(i, e.target.value)} />
                    <Input label="Label (optional)" value={s.label}
                      placeholder="e.g. High achievers"
                      onChange={(e) => updateSlot(i, "label", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={loading}
              disabled={slotMismatch || sizeNum === 0}>
              Create Rule
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
