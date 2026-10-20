"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import type { Semester, AcademicYearOption } from "./page";

interface Props {
  initialSemesters: Semester[];
  academicYears: AcademicYearOption[];
}

export function SemestersClient({ initialSemesters, academicYears }: Props) {
  const [semesters, setSemesters]  = useState(initialSemesters);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel]          = useState("");
  const [yearId, setYearId]        = useState("");
  const [error, setError]          = useState<string | null>(null);
  const [isLoading, setIsLoading]  = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, academic_year_id: yearId }),
    });
    const data = await res.json() as { semester?: Semester; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create semester."); setIsLoading(false); return; }
    // attach year label for display
    const year = academicYears.find((y) => y.id === yearId);
    const newSemester = { ...data.semester!, academic_years: year ? { label: year.label } : null };
    setSemesters((prev) => [...prev, newSemester]);
    setShowCreate(false); setLabel(""); setYearId(""); setIsLoading(false);
  }

  async function handleClose(id: string, lbl: string) {
    if (!confirm(`Close semester "${lbl}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/semesters/${id}/close`, { method: "PATCH" });
    if (res.ok) setSemesters((prev) => prev.map((s) => s.id === id ? { ...s, is_closed: true } : s));
  }

  const columns = [
    { key: "label", header: "Semester", sortable: true },
    {
      key: "academic_year", header: "Academic Year",
      render: (r: Semester) => r.academic_years?.label ?? "—",
    },
    {
      key: "is_closed", header: "Status",
      render: (r: Semester) => (
        <Badge variant={r.is_closed ? "neutral" : "approved"}>
          {r.is_closed ? "Closed" : "Open"}
        </Badge>
      ),
    },
    {
      key: "actions", header: "Actions",
      render: (r: Semester) =>
        !r.is_closed ? (
          <Button variant="ghost" size="sm" onClick={() => handleClose(r.id, r.label)}>
            Close
          </Button>
        ) : <span className="text-xs text-neutral-400">Closed</span>,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          Add Semester
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={semesters} emptyMessage="No semesters found." caption="Semesters" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Semester">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <Select
            label="Academic Year"
            value={yearId}
            onValueChange={setYearId}
            options={academicYears.map((y) => ({ value: y.id, label: y.label }))}
            placeholder="Select academic year…"
          />
          <Input
            label="Semester Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Odd 2024"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading} disabled={!yearId}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
