"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { AcademicYear } from "./page";

interface Props {
  deptId: string;
  deptCode: string;
  initialYears: AcademicYear[];
}

export function DeptAcademicYearsClient({ deptId, deptCode, initialYears }: Props) {
  const router = useRouter();
  const [years, setYears]           = useState(initialYears);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel]           = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);

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

  async function handleClose(id: string, lbl: string) {
    if (!confirm(`Close academic year "${lbl}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/academic-years/${id}/close`, { method: "PATCH" });
    if (res.ok) setYears((prev) => prev.map((y) => y.id === id ? { ...y, is_closed: true } : y));
  }

  const columns = [
    { key: "label", header: "Academic Year", sortable: true },
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
      render: (r: AcademicYear) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/departments/${deptId}/${r.id}`)}
          >
            Semesters &amp; Sections →
          </Button>
          {!r.is_closed && (
            <Button variant="ghost" size="sm" onClick={() => handleClose(r.id, r.label)}>
              Close Year
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Academic years are shared across all departments. Click <strong>Semesters &amp; Sections</strong> to manage {deptCode}-specific sections.
        </p>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          Add Academic Year
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable
          columns={columns}
          data={years}
          emptyMessage="No academic years yet. Add one to get started."
          caption="Academic years"
        />
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
