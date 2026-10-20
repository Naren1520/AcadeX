"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";

export type StudentRow = {
  id: string;
  usn: string;
  cgpa: number;
  section_id: string | null;
  profiles:    { full_name: string; email: string } | null;
  departments: { name: string; code: string } | null;
  sections:    { label: string } | null;
};

export type SectionOption = {
  id: string;
  label: string;
  dept_code: string;
  semester_label: string;
};

interface Props {
  students: StudentRow[];
  sections: SectionOption[];
}

export function StudentsTable({ students, sections }: Props) {
  const [rows, setRows]           = useState(students);
  const [editing, setEditing]     = useState<StudentRow | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function openEdit(student: StudentRow) {
    setEditing(student);
    setSectionId(student.section_id ?? "");
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setIsLoading(true); setError(null);

    const res = await fetch(`/api/admin/students/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId || null }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to update."); setIsLoading(false); return; }

    const sec = sections.find((s) => s.id === sectionId);
    setRows((prev) => prev.map((r) =>
      r.id === editing.id
        ? { ...r, section_id: sectionId || null, sections: sec ? { label: sec.label } : null }
        : r
    ));
    setEditing(null); setIsLoading(false);
  }

  const columns = [
    { key: "usn",        header: "USN",        sortable: true },
    { key: "full_name",  header: "Name",        render: (r: StudentRow) => r.profiles?.full_name ?? "—" },
    { key: "email",      header: "Email",       render: (r: StudentRow) => <span className="text-xs">{r.profiles?.email ?? "—"}</span> },
    { key: "department", header: "Department",  render: (r: StudentRow) => r.departments?.code ?? "—" },
    { key: "section",    header: "Section",     render: (r: StudentRow) => r.sections?.label ?? <span className="text-xs text-neutral-400">Unassigned</span> },
    { key: "cgpa",       header: "CGPA",        sortable: true, render: (r: StudentRow) => r.cgpa.toFixed(2) },
    {
      key: "actions", header: "",
      render: (r: StudentRow) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
          Assign Section
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={rows} emptyMessage="No students found." caption="All students" />
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        title={`Assign Section — ${editing?.profiles?.full_name ?? ""}`}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormError message={error} />
          <p className="text-sm text-neutral-600">
            USN: <strong>{editing?.usn}</strong> &nbsp;|&nbsp; Dept: <strong>{editing?.departments?.code}</strong>
          </p>
          <Select
            label="Section"
            value={sectionId}
            onValueChange={setSectionId}
            options={[
              { value: "", label: "No section (unassigned)" },
              ...sections.map((s) => ({
                value: s.id,
                label: `${s.label} — ${s.dept_code} (${s.semester_label})`,
              })),
            ]}
            placeholder="Select section…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Save</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
