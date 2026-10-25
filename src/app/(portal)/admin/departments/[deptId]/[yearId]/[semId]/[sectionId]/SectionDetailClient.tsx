"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import type {
  StudentInSection, FacultyInSection,
  StudentOption, FacultyOption,
} from "./page";

interface Props {
  sectionId: string;
  sectionLabel: string;
  deptId: string;
  deptCode: string;
  isClosed: boolean;
  initialStudents: StudentInSection[];
  initialFaculty: FacultyInSection[];
  studentOptions: StudentOption[];
  facultyOptions: FacultyOption[];
}

export function SectionDetailClient({
  sectionId, sectionLabel, deptId, deptCode, isClosed,
  initialStudents, initialFaculty, studentOptions, facultyOptions,
}: Props) {
  const [students, setStudents] = useState(initialStudents);
  const [faculty, setFaculty]   = useState(initialFaculty);

  // ── Add student 
  const [showAddStudent, setShowAddStudent]     = useState(false);
  const [selectedStudent, setSelectedStudent]   = useState("");
  const [studentError, setStudentError]         = useState<string | null>(null);
  const [studentLoading, setStudentLoading]     = useState(false);

  // ── Assign faculty 
  const [showAddFaculty, setShowAddFaculty]     = useState(false);
  const [selectedFaculty, setSelectedFaculty]   = useState("");
  const [facultyError, setFacultyError]         = useState<string | null>(null);
  const [facultyLoading, setFacultyLoading]     = useState(false);

  // Available options (exclude already-added)
  const studentInSet = new Set(students.map((s) => s.id));
  const facultyInSet = new Set(faculty.map((f) => f.faculty_id));
  const availableStudents = studentOptions.filter((s) => !studentInSet.has(s.id));
  const availableFaculty  = facultyOptions.filter((f) => !facultyInSet.has(f.id));

  // ────────
  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudentLoading(true); setStudentError(null);

    const res = await fetch(`/api/admin/students/${selectedStudent}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setStudentError(data.error ?? "Failed."); setStudentLoading(false); return; }

    const s = studentOptions.find((x) => x.id === selectedStudent)!;
    setStudents((prev) => [...prev, { id: s.id, usn: s.usn, full_name: s.full_name, email: s.email, cgpa: s.cgpa }]);
    setShowAddStudent(false); setSelectedStudent(""); setStudentLoading(false);
  }

  async function handleRemoveStudent(studentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: null }),
    });
    if (res.ok) setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }

  async function handleAssignFaculty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFaculty) return;
    setFacultyLoading(true); setFacultyError(null);

    const res = await fetch("/api/admin/faculty-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faculty_id: selectedFaculty, section_id: sectionId, department_id: deptId }),
    });
    const data = await res.json() as { assignment?: { id: string }; error?: string };
    if (!res.ok) { setFacultyError(data.error ?? "Failed."); setFacultyLoading(false); return; }

    const f = facultyOptions.find((x) => x.id === selectedFaculty)!;
    setFaculty((prev) => [...prev, { assignment_id: data.assignment!.id, faculty_id: f.id, full_name: f.full_name, email: f.email, can_manage_students: false }]);
    setShowAddFaculty(false); setSelectedFaculty(""); setFacultyLoading(false);
  }

  // ── Toggle can_manage_students 
  async function handleToggleManage(assignmentId: string, current: boolean) {
    const res = await fetch(`/api/admin/faculty-assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ can_manage_students: !current }),
    });
    if (res.ok) {
      setFaculty((prev) => prev.map((f) =>
        f.assignment_id === assignmentId ? { ...f, can_manage_students: !current } : f
      ));
    }
  }

  async function handleRemoveFaculty(assignmentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(`/api/admin/faculty-assignments/${assignmentId}`, { method: "DELETE" });
    if (res.ok) setFaculty((prev) => prev.filter((f) => f.assignment_id !== assignmentId));
  }

  // ────────
  return (
    <div className="flex flex-col gap-8">

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Section",   value: sectionLabel,          bg: "#f8fafc", color: "#1e3a5f" },
          { label: "Dept",      value: deptCode,               bg: "#f8fafc", color: "#1e3a5f" },
          { label: "Students",  value: String(students.length), bg: "#f0fdf4", color: "#16a34a" },
          { label: "Faculty",   value: String(faculty.length),  bg: "#eff6ff", color: "#1e3a5f" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl px-5 py-4 text-center" style={{ backgroundColor: stat.bg, border: "1px solid #e5e7eb" }}>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Faculty panel ── */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#eff6ff", borderBottom: "1px solid #e5e7eb" }}>
            <div>
              <h2 className="font-semibold text-neutral-800">Faculty</h2>
              <p className="text-xs text-neutral-500">{faculty.length} assigned</p>
            </div>
            {!isClosed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSelectedFaculty(""); setFacultyError(null); setShowAddFaculty(true); }}
              >
                + Assign Faculty
              </Button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-neutral-100">
            {faculty.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-neutral-400">
                No faculty assigned yet.
              </div>
            ) : (
              faculty.map((f) => (
                <div key={f.assignment_id} className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "#dbeafe", color: "#1e3a5f" }}
                    >
                      {f.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{f.full_name}</p>
                      <p className="text-xs text-neutral-500">{f.email}</p>
                      {/* Permission badge */}
                      <span
                        className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: f.can_manage_students ? "#f0fdf4" : "#f9fafb",
                          color: f.can_manage_students ? "#16a34a" : "#9ca3af",
                          border: `1px solid ${f.can_manage_students ? "#bbf7d0" : "#e5e7eb"}`,
                        }}
                      >
                        {f.can_manage_students ? "Can manage students" : "View only"}
                      </span>
                    </div>
                  </div>
                  {!isClosed && (
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleManage(f.assignment_id, f.can_manage_students)}
                        title={f.can_manage_students ? "Revoke student management access" : "Grant student management access"}
                        className="cursor-pointer rounded-full transition-colors"
                        style={{
                          width: 36, height: 20,
                          backgroundColor: f.can_manage_students ? "#16a34a" : "#d1d5db",
                          position: "relative", flexShrink: 0,
                        }}
                        aria-label={f.can_manage_students ? "Revoke manage students permission" : "Grant manage students permission"}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2, left: f.can_manage_students ? 18 : 2,
                            width: 16, height: 16,
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                            transition: "left 0.15s",
                            display: "block",
                          }}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaculty(f.assignment_id, f.full_name)}
                        className="cursor-pointer rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Students panel ── */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#f0fdf4", borderBottom: "1px solid #e5e7eb" }}>
            <div>
              <h2 className="font-semibold text-neutral-800">Students</h2>
              <p className="text-xs text-neutral-500">{students.length} enrolled</p>
            </div>
            {!isClosed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSelectedStudent(""); setStudentError(null); setShowAddStudent(true); }}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                + Add Student
              </Button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-neutral-100">
            {students.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-neutral-400">
                No students enrolled yet.
              </div>
            ) : (
              students.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                    >
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {s.full_name}
                        <span className="ml-2 text-xs font-normal text-neutral-400">{s.usn}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-neutral-500">{s.email}</p>
                        <span className="text-xs" style={{ color: "#16a34a" }}>CGPA {s.cgpa.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {!isClosed && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(s.id, s.full_name)}
                      className="cursor-pointer rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Add Student dialog ── */}
      <Dialog
        open={showAddStudent}
        onOpenChange={(o) => { if (!o) setShowAddStudent(false); }}
        title="Add Student to Section"
        description={`Assign a ${deptCode} student to section ${sectionLabel}.`}
      >
        <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
          <FormError message={studentError} />
          <Select
            label="Student"
            value={selectedStudent}
            onValueChange={setSelectedStudent}
            options={availableStudents.map((s) => ({
              value: s.id,
              label: `${s.full_name} (${s.usn}) — CGPA ${s.cgpa.toFixed(2)}${s.section_id ? " ⚠ in another section" : ""}`,
            }))}
            placeholder="Select student…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddStudent(false)}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={studentLoading}
              disabled={!selectedStudent}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
            >
              Assign
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── Assign Faculty dialog ── */}
      <Dialog
        open={showAddFaculty}
        onOpenChange={(o) => { if (!o) setShowAddFaculty(false); }}
        title="Assign Faculty to Section"
        description={`Assign a faculty member to section ${sectionLabel}.`}
      >
        <form onSubmit={handleAssignFaculty} className="flex flex-col gap-4">
          <FormError message={facultyError} />
          <Select
            label="Faculty Member"
            value={selectedFaculty}
            onValueChange={setSelectedFaculty}
            options={availableFaculty.map((f) => ({
              value: f.id,
              label: `${f.full_name} (${f.email})`,
            }))}
            placeholder="Select faculty…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddFaculty(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={facultyLoading} disabled={!selectedFaculty}>
              Assign
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
