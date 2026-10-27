"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";

interface Section { id: string; label: string; department: string; }
interface Rule { id: string; section_id: string; cgpa_lower: number; cgpa_upper: number; min_team_size: number; max_team_size: number; max_teams: number; is_enabled: boolean; sections?: Record<string, unknown>; }

interface Props {
  initialRules: Record<string, unknown>[];
  sections: Section[];
}

export function TeamFormationRulesClient({ initialRules, sections }: Props) {
  const [rules, setRules] = useState<Rule[]>(initialRules as unknown as Rule[]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ section_id: "", cgpa_lower: "0", cgpa_upper: "10", min_team_size: "2", max_team_size: "4", max_teams: "5" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function updateForm(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const body = {
      section_id: form.section_id,
      cgpa_lower: parseFloat(form.cgpa_lower),
      cgpa_upper: parseFloat(form.cgpa_upper),
      min_team_size: parseInt(form.min_team_size),
      max_team_size: parseInt(form.max_team_size),
      max_teams: parseInt(form.max_teams),
    };
    const res = await fetch("/api/team-formation/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { rule?: Rule; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create rule."); setIsLoading(false); return; }
    setRules((p) => [data.rule!, ...p]);
    setShowCreate(false); setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule? Teams already formed will not be affected.")) return;
    const res = await fetch(`/api/team-formation/rules/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json() as { soft?: boolean };
      if (data.soft) {
        setRules((p) => p.map((r) => r.id === id ? { ...r, is_enabled: false } : r));
      } else {
        setRules((p) => p.filter((r) => r.id !== id));
      }
    }
  }

  const columns = [
    {
      key: "section", header: "Section", render: (r: Rule) => {
        const s = sections.find((sec) => sec.id === r.section_id);
        return <span>{s ? `${s.label} - ${s.department}` : r.section_id}</span>;
      }
    },
    { key: "cgpa_lower", header: "CGPA Band", render: (r: Rule) => `${r.cgpa_lower} – ${r.cgpa_upper}` },
    { key: "min_team_size", header: "Team Size", render: (r: Rule) => `${r.min_team_size} – ${r.max_team_size}` },
    { key: "max_teams", header: "Max Teams", render: (r: Rule) => String(r.max_teams) },
    {
      key: "is_enabled", header: "Status", render: (r: Rule) => (
        <Badge variant={r.is_enabled ? "approved" : "neutral"}>{r.is_enabled ? "Active" : "Disabled"}</Badge>
      )
    },
    {
      key: "actions", header: "", render: (r: Rule) => (
        r.is_enabled
          ? <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
          : null
      )
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>Add Rule</Button>
      </div>
      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={rules} emptyMessage="No rules configured." caption="Team formation rules" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="New Team Formation Rule">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Section</label>
            <select value={form.section_id} onChange={(e) => updateForm("section_id", e.target.value)} required
              className="block w-full rounded px-3 py-2 text-sm" style={{ border: "1px solid #d1d5db" }}>
              <option value="">Select section…</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.label} - {s.department}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="CGPA Lower" type="number" step="0.01" min="0" max="10" value={form.cgpa_lower} onChange={(e) => updateForm("cgpa_lower", e.target.value)} required />
            <Input label="CGPA Upper" type="number" step="0.01" min="0" max="10" value={form.cgpa_upper} onChange={(e) => updateForm("cgpa_upper", e.target.value)} required />
            <Input label="Min Team Size" type="number" min="1" value={form.min_team_size} onChange={(e) => updateForm("min_team_size", e.target.value)} required />
            <Input label="Max Team Size" type="number" min="1" value={form.max_team_size} onChange={(e) => updateForm("max_team_size", e.target.value)} required />
            <Input label="Max Teams" type="number" min="1" value={form.max_teams} onChange={(e) => updateForm("max_teams", e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create Rule</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
