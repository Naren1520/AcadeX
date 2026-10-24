"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { Rule } from "../page";

interface Props {
  sectionId: string;
  initialRules: Rule[];
}

export function TeamRulesTab({ sectionId, initialRules }: Props) {
  const [rules, setRules]     = useState(initialRules);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({
    cgpa_lower: "0", cgpa_upper: "10",
    min_team_size: "2", max_team_size: "4", max_teams: "5",
  });
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function f(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/team-formation/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id:    sectionId,
        cgpa_lower:    parseFloat(form.cgpa_lower),
        cgpa_upper:    parseFloat(form.cgpa_upper),
        min_team_size: parseInt(form.min_team_size),
        max_team_size: parseInt(form.max_team_size),
        max_teams:     parseInt(form.max_teams),
      }),
    });
    const data = await res.json() as { rule?: Rule; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(false); return; }
    setRules((p) => [data.rule!, ...p]);
    setShowAdd(false); setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule? Teams already formed are not affected.")) return;
    const res = await fetch(`/api/team-formation/rules/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json() as { soft?: boolean };
      if (data.soft) setRules((p) => p.map((r) => r.id === id ? { ...r, is_enabled: false } : r));
      else           setRules((p) => p.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>Add Rule</Button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          No team formation rules yet. Add one to control team eligibility.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ border: "1px solid #e5e7eb", backgroundColor: r.is_enabled ? "#fff" : "#f9fafb" }}>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant={r.is_enabled ? "approved" : "neutral"}>
                  {r.is_enabled ? "Active" : "Disabled"}
                </Badge>
                <div className="text-sm text-neutral-700">
                  CGPA&nbsp;<strong>{r.cgpa_lower}</strong> – <strong>{r.cgpa_upper}</strong>
                </div>
                <div className="text-sm text-neutral-700">
                  Team size&nbsp;<strong>{r.min_team_size}</strong> – <strong>{r.max_team_size}</strong>
                </div>
                <div className="text-sm text-neutral-700">
                  Max teams&nbsp;<strong>{r.max_teams}</strong>
                </div>
              </div>
              {r.is_enabled && (
                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd} title="New Team Formation Rule">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="CGPA Lower" type="number" step="0.01" min="0" max="10"
              value={form.cgpa_lower} onChange={(e) => f("cgpa_lower", e.target.value)} required />
            <Input label="CGPA Upper" type="number" step="0.01" min="0" max="10"
              value={form.cgpa_upper} onChange={(e) => f("cgpa_upper", e.target.value)} required />
            <Input label="Min Team Size" type="number" min="1"
              value={form.min_team_size} onChange={(e) => f("min_team_size", e.target.value)} required />
            <Input label="Max Team Size" type="number" min="1"
              value={form.max_team_size} onChange={(e) => f("max_team_size", e.target.value)} required />
            <Input label="Max Teams" type="number" min="1"
              value={form.max_teams} onChange={(e) => f("max_teams", e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={loading}>Create Rule</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
