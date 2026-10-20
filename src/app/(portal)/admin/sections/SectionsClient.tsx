"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import type { Section, SemesterOption, DepartmentOption } from "./page";

interface Props {
  initialSections: Section[];
  semesters: SemesterOption[];
  departments: DepartmentOption[];
}

export function SectionsClient({ initialSections, semesters, departments }: Props) {
  const [sections, setSections]   = useState(initialSections);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel]         = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [deptId, setDeptId]       = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, semester_id: semesterId, department_id: deptId }),
    });
    const data = await res.json() as { section?: Section; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create section."); setIsLoading(false); return; }
    const sem  = semesters.find((s) => s.id === semesterId);
    const dept = departments.find((d) => d.id === deptId);
    const newSection = {
      ...data.section!,
      semesters:   sem  ? { label: sem.label, is_closed: false } : null,
      departments: dept ? { name: dept.name, code: dept.code } : null,
    };
    setSections((prev) => [...prev, newSection]);
    setShowCreate(false); setLabel(""); setSemesterId(""); setDeptId(""); setIsLoading(false);
  }

  const columns = [
    { key: "label", header: "Section", sortable: true },
    { key: "semester",   header: "Semester",   render: (r: Section) => r.semesters?.label   ?? "—" },
    { key: "department", header: "Department", render: (r: Section) => r.departments ? `${r.departments.name} (${r.departments.code})` : "—" },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          Add Section
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={sections} emptyMessage="No sections found. Create academic years and semesters first." caption="Sections" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Section">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <Select
            label="Semester"
            value={semesterId}
            onValueChange={setSemesterId}
            options={semesters.map((s) => ({ value: s.id, label: `${s.label} (${s.academic_year_label})` }))}
            placeholder="Select semester…"
          />
          <Select
            label="Department"
            value={deptId}
            onValueChange={setDeptId}
            options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
            placeholder="Select department…"
          />
          <Input
            label="Section Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="CS-A"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading} disabled={!semesterId || !deptId}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
