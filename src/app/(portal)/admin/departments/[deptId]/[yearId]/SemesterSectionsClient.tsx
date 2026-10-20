"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import type {
  Semester, Section, StudentInSection, FacultyInSection,
  FacultyOption, StudentOption,
} from "./page";

interface Props {
  deptId: string;
  deptCode: string;
  yearId: string;
  yearLabel: string;
  initialSemesters: Semester[];
  studentOptions: StudentOption[];
  facultyOptions: FacultyOption[];
}

export function SemesterSectionsClient({
  deptId, deptCode, yearId, yearLabel,
  initialSemesters, studentOptions, facultyOptions,
}: Props) {
  const [semesters, setSemesters] = useState(initialSemesters);

  // Track which section panels are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ── Add Semester ──────────────────────────────────────────────
  const [showAddSem, setShowAddSem]   = useState(false);
  const [semLabel, setSemLabel]       = useState("");
  const [semError, setSemError]       = useState<string | null>(null);
  const [semLoading, setSemLoading]   = useState(false);

  // ── Add Section ───────────────────────────────────────────────
  const [addingSectionFor, setAddingSectionFor] = useState<Semester | null>(null);
  const [secLabel, setSecLabel]                 = useState("");
  const [secError, setSecError]                 = useState<string | null>(null);
  const [secLoading, setSecLoading]             = useState(false);

  // ── Add Student to section ────────────────────────────────────
  const [addStudentToSection, setAddStudentToSection] = useState<Section | null>(null);
  const [selectedStudentId, setSelectedStudentId]     = useState("");
  const [studentError, setStudentError]               = useState<string | null>(null);
  const [studentLoading, setStudentLoading]           = useState(false);

  // ── Assign Faculty to section ─────────────────────────────────
  const [assignFacultyToSection, setAssignFacultyToSection] = useState<Section | null>(null);
  const [selectedFacultyId, setSelectedFacultyId]           = useState("");
  const [facultyError, setFacultyError]                     = useState<string | null>(null);
  const [facultyLoading, setFacultyLoading]                 = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Helpers to mutate semesters state
  // ─────────────────────────────────────────────────────────────
  function updateSection(sectionId: string, updater: (sec: Section) => Section) {
    setSemesters((prev) => prev.map((sem) => ({
      ...sem,
      sections: sem.sections.map((sec) => sec.id === sectionId ? updater(sec) : sec),
    })));
  }

  // ─────────────────────────────────────────────────────────────
  // Add semester
  // ─────────────────────────────────────────────────────────────
  async function handleAddSemester(e: React.FormEvent) {
    e.preventDefault();
    setSemLoading(true); setSemError(null);
    const res = await fetch("/api/admin/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: semLabel, academic_year_id: yearId }),
    });
    const data = await res.json() as { semester?: { id: string; label: string; is_closed: boolean }; error?: string };
    if (!res.ok) { setSemError(data.error ?? "Failed to create semester."); setSemLoading(false); return; }
    setSemesters((prev) => [...prev, { ...data.semester!, sections: [] }]);
    setShowAddSem(false); setSemLabel(""); setSemLoading(false);
  }

  async function handleCloseSemester(semId: string, lbl: string) {
    if (!confirm(`Close semester "${lbl}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/semesters/${semId}/close`, { method: "PATCH" });
    if (res.ok) setSemesters((prev) => prev.map((s) => s.id === semId ? { ...s, is_closed: true } : s));
  }

  // ─────────────────────────────────────────────────────────────
  // Add section
  // ─────────────────────────────────────────────────────────────
  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    if (!addingSectionFor) return;
    setSecLoading(true); setSecError(null);
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: secLabel, semester_id: addingSectionFor.id, department_id: deptId }),
    });
    const data = await res.json() as { section?: { id: string; label: string; semester_id: string; department_id: string }; error?: string };
    if (!res.ok) { setSecError(data.error ?? "Failed to create section."); setSecLoading(false); return; }
    setSemesters((prev) => prev.map((s) =>
      s.id === addingSectionFor.id
        ? { ...s, sections: [...s.sections, { ...data.section!, students: [], faculty: [] }] }
        : s
    ));
    setAddingSectionFor(null); setSecLabel(""); setSecLoading(false);
  }

  // ─────────────────────────────────────────────────────────────
  // Add student to section
  // ─────────────────────────────────────────────────────────────
  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!addStudentToSection || !selectedStudentId) return;
    setStudentLoading(true); setStudentError(null);

    const res = await fetch(`/api/admin/students/${selectedStudentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: addStudentToSection.id }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setStudentError(data.error ?? "Failed to assign student."); setStudentLoading(false); return; }

    const student = studentOptions.find((s) => s.id === selectedStudentId)!;
    const newStudent: StudentInSection = {
      id: student.id, usn: student.usn,
      full_name: student.full_name, email: student.email, cgpa: student.cgpa,
    };
    updateSection(addStudentToSection.id, (sec) => ({
      ...sec, students: [...sec.students, newStudent],
    }));
    setAddStudentToSection(null); setSelectedStudentId(""); setStudentLoading(false);
  }

  async function handleRemoveStudent(sectionId: string, studentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: null }),
    });
    if (res.ok) {
      updateSection(sectionId, (sec) => ({
        ...sec, students: sec.students.filter((s) => s.id !== studentId),
      }));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Assign faculty to section
  // ─────────────────────────────────────────────────────────────
  async function handleAssignFaculty(e: React.FormEvent) {
    e.preventDefault();
    if (!assignFacultyToSection || !selectedFacultyId) return;
    setFacultyLoading(true); setFacultyError(null);

    const res = await fetch("/api/admin/faculty-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faculty_id:    selectedFacultyId,
        section_id:    assignFacultyToSection.id,
        department_id: deptId,
      }),
    });
    const data = await res.json() as { assignment?: { id: string }; error?: string };
    if (!res.ok) { setFacultyError(data.error ?? "Failed to assign faculty."); setFacultyLoading(false); return; }

    const fac = facultyOptions.find((f) => f.id === selectedFacultyId)!;
    const newFaculty: FacultyInSection = {
      assignment_id: data.assignment!.id,
      faculty_id: fac.id,
      full_name: fac.full_name,
      email: fac.email,
    };
    updateSection(assignFacultyToSection.id, (sec) => ({
      ...sec, faculty: [...sec.faculty, newFaculty],
    }));
    setAssignFacultyToSection(null); setSelectedFacultyId(""); setFacultyLoading(false);
  }

  async function handleRemoveFaculty(sectionId: string, assignmentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(`/api/admin/faculty-assignments/${assignmentId}`, { method: "DELETE" });
    if (res.ok) {
      updateSection(sectionId, (sec) => ({
        ...sec, faculty: sec.faculty.filter((f) => f.assignment_id !== assignmentId),
      }));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Students available to add to a section (not already in it)
  // ─────────────────────────────────────────────────────────────
  function availableStudents(section: Section | null) {
    if (!section) return [];
    const alreadyIn = new Set(section.students.map((s) => s.id));
    return studentOptions.filter((s) => !alreadyIn.has(s.id));
  }

  // Faculty not already assigned to this section
  function availableFaculty(section: Section | null) {
    if (!section) return [];
    const alreadyIn = new Set(section.faculty.map((f) => f.faculty_id));
    return facultyOptions.filter((f) => !alreadyIn.has(f.id));
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <strong>{deptCode}</strong> — <strong>{yearLabel}</strong>
        </p>
        <Button variant="primary" size="sm" onClick={() => { setSemLabel(""); setSemError(null); setShowAddSem(true); }}>
          Add Semester
        </Button>
      </div>

      {semesters.length === 0 && (
        <div className="rounded p-8 text-center text-sm text-neutral-500" style={{ border: "1px dashed #d1d5db" }}>
          No semesters yet. Click <strong>Add Semester</strong> to get started.
        </div>
      )}

      {/* ── Semester cards ── */}
      {semesters.map((sem) => (
        <div key={sem.id} className="rounded-lg overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>

          {/* Semester header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-800">{sem.label}</span>
              <Badge variant={sem.is_closed ? "neutral" : "approved"}>
                {sem.is_closed ? "Closed" : "Open"}
              </Badge>
              <span className="text-xs text-neutral-400">{sem.sections.length} section{sem.sections.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              {!sem.is_closed && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => { setAddingSectionFor(sem); setSecLabel(""); setSecError(null); }}>
                    + Add Section
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCloseSemester(sem.id, sem.label)}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Sections list */}
          {sem.sections.length === 0 ? (
            <div className="px-4 py-4 text-sm text-neutral-400 italic">
              No {deptCode} sections yet.{!sem.is_closed && ' Click "+ Add Section" above.'}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {sem.sections.map((sec) => {
                const isExpanded = expandedSections.has(sec.id);
                return (
                  <div key={sec.id}>

                    {/* Section row — click to expand */}
                    <button
                      type="button"
                      onClick={() => setExpandedSections((prev) => {
                        const next = new Set(prev);
                        isExpanded ? next.delete(sec.id) : next.add(sec.id);
                        return next;
                      })}
                      className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-neutral-800">{sec.label}</span>
                        <span className="text-xs text-neutral-400">
                          {sec.students.length} student{sec.students.length !== 1 ? "s" : ""}
                          {" · "}
                          {sec.faculty.length} faculty
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400">{isExpanded ? "▲ collapse" : "▼ expand"}</span>
                    </button>

                    {/* Expanded section panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4" style={{ backgroundColor: "#fafafa", borderTop: "1px solid #f3f4f6" }}>
                        <div className="mt-4 grid gap-6 md:grid-cols-2">

                          {/* ── Faculty column ── */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Faculty</span>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => { setAssignFacultyToSection(sec); setSelectedFacultyId(""); setFacultyError(null); }}
                              >
                                + Assign Faculty
                              </Button>
                            </div>
                            {sec.faculty.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No faculty assigned.</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {sec.faculty.map((f) => (
                                  <div key={f.assignment_id} className="flex items-center justify-between rounded px-3 py-2" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                                    <div>
                                      <p className="text-sm font-medium text-neutral-800">{f.full_name}</p>
                                      <p className="text-xs text-neutral-500">{f.email}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFaculty(sec.id, f.assignment_id, f.full_name)}
                                      className="cursor-pointer text-xs text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ── Students column ── */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Students ({sec.students.length})
                              </span>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => { setAddStudentToSection(sec); setSelectedStudentId(""); setStudentError(null); }}
                              >
                                + Add Student
                              </Button>
                            </div>
                            {sec.students.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No students assigned.</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {sec.students.map((s) => (
                                  <div key={s.id} className="flex items-center justify-between rounded px-3 py-2" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                    <div>
                                      <p className="text-sm font-medium text-neutral-800">{s.full_name} <span className="text-xs text-neutral-400">({s.usn})</span></p>
                                      <p className="text-xs text-neutral-500">CGPA: {s.cgpa.toFixed(2)}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStudent(sec.id, s.id, s.full_name)}
                                      className="cursor-pointer text-xs text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* ── Add Semester dialog ── */}
      <Dialog open={showAddSem} onOpenChange={setShowAddSem} title="Add Semester">
        <form onSubmit={handleAddSemester} className="flex flex-col gap-4">
          <FormError message={semError} />
          <Input label="Semester Label" value={semLabel} onChange={(e) => setSemLabel(e.target.value)} required placeholder="Odd 2024" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddSem(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={semLoading}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Add Section dialog ── */}
      <Dialog
        open={!!addingSectionFor}
        onOpenChange={(o) => { if (!o) setAddingSectionFor(null); }}
        title={`Add Section — ${addingSectionFor?.label ?? ""}`}
        description={`New ${deptCode} section in this semester.`}
      >
        <form onSubmit={handleAddSection} className="flex flex-col gap-4">
          <FormError message={secError} />
          <Input label="Section Label" value={secLabel} onChange={(e) => setSecLabel(e.target.value)} required placeholder="CS-A" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setAddingSectionFor(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={secLoading}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Add Student dialog ── */}
      <Dialog
        open={!!addStudentToSection}
        onOpenChange={(o) => { if (!o) setAddStudentToSection(null); }}
        title={`Add Student — ${addStudentToSection?.label ?? ""}`}
        description="Assign a student from this department to this section."
      >
        <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
          <FormError message={studentError} />
          <Select
            label="Student"
            value={selectedStudentId}
            onValueChange={setSelectedStudentId}
            options={availableStudents(addStudentToSection).map((s) => ({
              value: s.id,
              label: `${s.full_name} (${s.usn})${s.section_id ? " — already in a section" : ""}`,
            }))}
            placeholder="Select student…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setAddStudentToSection(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={studentLoading} disabled={!selectedStudentId}>Assign</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Assign Faculty dialog ── */}
      <Dialog
        open={!!assignFacultyToSection}
        onOpenChange={(o) => { if (!o) setAssignFacultyToSection(null); }}
        title={`Assign Faculty — ${assignFacultyToSection?.label ?? ""}`}
        description="Assign a faculty member to this section."
      >
        <form onSubmit={handleAssignFaculty} className="flex flex-col gap-4">
          <FormError message={facultyError} />
          <Select
            label="Faculty"
            value={selectedFacultyId}
            onValueChange={setSelectedFacultyId}
            options={availableFaculty(assignFacultyToSection).map((f) => ({
              value: f.id,
              label: `${f.full_name} (${f.email})`,
            }))}
            placeholder="Select faculty…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setAssignFacultyToSection(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={facultyLoading} disabled={!selectedFacultyId}>Assign</Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
