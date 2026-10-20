"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import type { Assignment, FacultyOption, SectionOption, DepartmentOption } from "./page";

interface Props {
  initialAssignments: Assignment[];
  faculty: FacultyOption[];
  sections: SectionOption[];
  departments: DepartmentOption[];
}

export function FacultyAssignmentsClient({ initialAssignments, faculty, sections, departments }: Props) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [showCreate, setShowCreate]   = useState(false);
  const [facultyId, setFacultyId]     = useState("");
  const [sectionId, setSectionId]     = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(false);

  // Auto-derive department_id from selected section
  const selectedSection = sections.find((s) => s.id === sectionId);

  function resetForm() { setFacultyId(""); setSectionId(""); setError(null); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSection) { setError("Please select a section."); return; }
    setIsLoading(true); setError(null);

    const res = await fetch("/api/admin/faculty-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faculty_id:    facultyId,
        section_id:    sectionId,
        department_id: selectedSection.department_id,
      }),
    });
    const data = await res.json() as { assignment?: Assignment; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create assignment."); setIsLoading(false); return; }

    const fac  = faculty.find((f) => f.id === facultyId);
    const dept = departments.find((d) => d.id === selectedSection.department_id);
    const newA = {
      ...data.assignment!,
      profiles:    fac  ? { full_name: fac.full_name, email: fac.email } : null,
      sections:    { label: selectedSection.label },
      departments: dept ? { name: dept.name, code: dept.code } : null,
    };
    setAssignments((prev) => [newA, ...prev]);
    setShowCreate(false); resetForm(); setIsLoading(false);
  }

  async function handleRemove(id: string, name: string, section: string) {
    if (!confirm(`Remove ${name} from section ${section}?`)) return;
    const res = await fetch(`/api/admin/faculty-assignments/${id}`, { method: "DELETE" });
    if (res.ok) setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  const columns = [
    { key: "faculty",    header: "Faculty",    render: (r: Assignment) => r.profiles?.full_name ?? "—" },
    { key: "email",      header: "Email",      render: (r: Assignment) => <span className="text-xs">{r.profiles?.email ?? "—"}</span> },
    { key: "section",    header: "Section",    render: (r: Assignment) => r.sections?.label ?? "—" },
    { key: "department", header: "Department", render: (r: Assignment) => r.departments ? `${r.departments.name} (${r.departments.code})` : "—" },
    {
      key: "actions", header: "Actions",
      render: (r: Assignment) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleRemove(r.id, r.profiles?.full_name ?? "Faculty", r.sections?.label ?? "")}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          Assign Faculty
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable
          columns={columns}
          data={assignments}
          emptyMessage="No faculty assignments yet. Create sections and faculty users first."
          caption="Faculty assignments"
        />
      </div>

      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) resetForm(); }} title="Assign Faculty to Section">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <Select
            label="Faculty Member"
            value={facultyId}
            onValueChange={setFacultyId}
            options={faculty.map((f) => ({ value: f.id, label: `${f.full_name} (${f.email})` }))}
            placeholder="Select faculty…"
          />
          <Select
            label="Section"
            value={sectionId}
            onValueChange={setSectionId}
            options={sections.map((s) => ({
              value: s.id,
              label: `${s.label} — ${s.dept_code} (${s.semester_label})`,
            }))}
            placeholder="Select section…"
          />
          {selectedSection && (
            <p className="text-xs text-neutral-500">
              Department will be set automatically from the selected section.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading} disabled={!facultyId || !sectionId}>Assign</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
