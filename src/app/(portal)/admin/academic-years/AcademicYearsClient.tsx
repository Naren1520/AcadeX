"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { AcademicYear } from "./page";

export function AcademicYearsClient({ initialYears }: { initialYears: AcademicYear[] }) {
  const [years, setYears]         = useState(initialYears);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel]         = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/academic-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json() as { academicYear?: AcademicYear; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create academic year."); setIsLoading(false); return; }
    setYears((prev) => [data.academicYear!, ...prev]);
    setShowCreate(false); setLabel(""); setIsLoading(false);
  }

  async function handleClose(id: string, currentLabel: string) {
    if (!confirm(`Close academic year "${currentLabel}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/academic-years/${id}/close`, { method: "PATCH" });
    if (res.ok) setYears((prev) => prev.map((y) => y.id === id ? { ...y, is_closed: true } : y));
  }

  const columns = [
    { key: "label", header: "Label", sortable: true },
    {
      key: "is_closed", header: "Status",
      render: (r: AcademicYear) => (
        <Badge variant={r.is_closed ? "neutral" : "approved"}>
          {r.is_closed ? "Closed" : "Open"}
        </Badge>
      ),
    },
    {
      key: "actions", header: "Actions",
      render: (r: AcademicYear) =>
        !r.is_closed ? (
          <Button variant="ghost" size="sm" onClick={() => handleClose(r.id, r.label)}>
            Close Year
          </Button>
        ) : <span className="text-xs text-neutral-400">Closed</span>,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          Add Academic Year
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={years} emptyMessage="No academic years found." caption="Academic years" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Academic Year">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="2024-25"
            hint='Format: "YYYY-YY" e.g. 2024-25'
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
