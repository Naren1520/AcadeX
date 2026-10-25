"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { FormError } from "@/components/forms/FormError";
import {
  IconUsers, IconUpload, IconDownload, IconFolder,
  IconCheck, IconAlertCircle, IconGitHub,
} from "@/components/ui/Icon";
import type { Student } from "../page";
import type { BulkStudentResult } from "@/app/api/faculty/sections/[sectionId]/students/bulk/route";

interface Props {
  sectionId: string;
  sectionLabel: string;
  deptCode: string;
  canManage: boolean;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

// ── Student detail side panel 
function StudentPanel({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-xl"
        style={{ borderLeft: "1px solid #e5e7eb" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #e5e7eb" }}>
          <p className="font-semibold text-neutral-900">Student Details</p>
          <button type="button" onClick={onClose}
            className="cursor-pointer rounded p-1.5 text-neutral-400 hover:text-neutral-700">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: "#1e3a5f" }}>
              {student.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900">{student.full_name}</p>
              <p className="font-mono text-xs text-neutral-500">{student.usn}</p>
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: "Email",   value: student.email },
            { label: "USN",     value: student.usn },
            { label: "CGPA",    value: student.cgpa.toFixed(2) },
          ].map((r) => (
            <div key={r.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{r.label}</p>
              <p className="mt-1 text-sm text-neutral-800">{r.value}</p>
            </div>
          ))}

          {/* GitHub */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">GitHub</p>
            {student.github_url ? (
              <a href={student.github_url} target="_blank" rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "#1e3a5f" }}>
                <IconGitHub size={14} /> {student.github_url.replace("https://github.com/", "")}
              </a>
            ) : (
              <p className="mt-1 text-sm text-neutral-400 italic">Not set</p>
            )}
          </div>

          {/* CGPA visual */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">CGPA Progress</p>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(student.cgpa / 10) * 100}%`, backgroundColor: "#16a34a" }} />
            </div>
            <p className="mt-1 text-xs text-neutral-500">{student.cgpa.toFixed(2)} / 10.00</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Bulk upload 
const HEADERS = ["full_name", "email", "password", "usn", "cgpa"] as const;
type ParsedRow = Record<string, string>;
interface PreviewRow {
  row: number; full_name: string; email: string; password: string;
  usn: string; cgpa: string; _valid: boolean; _errors: string[];
}

function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: "array" });
        resolve(XLSX.utils.sheet_to_json<ParsedRow>(wb.Sheets[wb.SheetNames[0]], { defval: "" }));
      } catch { reject(new Error("Cannot parse file. Use .xlsx or .csv.")); }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

function validateRows(rows: ParsedRow[]): PreviewRow[] {
  return rows.map((row, i) => {
    const errors: string[] = [];
    const r: PreviewRow = {
      row: i + 1,
      full_name: String(row.full_name ?? "").trim(),
      email:     String(row.email     ?? "").trim(),
      password:  String(row.password  ?? "").trim(),
      usn:       String(row.usn       ?? "").trim().toUpperCase(),
      cgpa:      String(row.cgpa      ?? "").trim(),
      _valid: true, _errors: [],
    };
    if (!r.full_name)                                             errors.push("full_name required");
    if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push("invalid email");
    if (!r.password || r.password.length < 8)                     errors.push("password ≥ 8 chars");
    if (!r.usn || !/^[A-Za-z0-9]{10}$/.test(r.usn))              errors.push("USN: 10 alphanumeric");
    const n = parseFloat(r.cgpa);
    if (r.cgpa === "" || isNaN(n) || n < 0 || n > 10)            errors.push("CGPA 0–10");
    r._errors = errors; r._valid = errors.length === 0;
    return r;
  });
}

// ── Main component 
export function StudentsTab({
  sectionId, sectionLabel, deptCode, canManage, students, setStudents,
}: Props) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add single student
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState({ full_name: "", email: "", password: "", usn: "", cgpa: "" });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Bulk upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [showBulk, setShowBulk]         = useState(false);
  const [bulkStep, setBulkStep]         = useState<"upload" | "preview" | "results">("upload");
  const [dragging, setDragging]         = useState(false);
  const [fileName, setFileName]         = useState<string | null>(null);
  const [parseError, setParseError]     = useState<string | null>(null);
  const [previewRows, setPreviewRows]   = useState<PreviewRow[]>([]);
  const [bulkResults, setBulkResults]   = useState<BulkStudentResult[]>([]);
  const [bulkSummary, setBulkSummary]   = useState<{ success: number; error: number } | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  function resetAdd() { setAddForm({ full_name: "", email: "", password: "", usn: "", cgpa: "" }); setAddError(null); }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true); setAddError(null);
    const res = await fetch(`/api/faculty/sections/${sectionId}/students`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, cgpa: parseFloat(addForm.cgpa) }),
    });
    const data = await res.json() as { student?: Student; error?: string };
    if (!res.ok) { setAddError(data.error ?? "Failed."); setAddLoading(false); return; }
    setStudents((prev) => [...prev, data.student!]);
    setShowAdd(false); resetAdd(); setAddLoading(false);
  }

  async function handleRemove(studentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(`/api/faculty/sections/${sectionId}/students?student_id=${studentId}`, { method: "DELETE" });
    if (res.ok) setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }

  // Bulk
  async function processFile(file: File) {
    setParseError(null); setFileName(file.name);
    try {
      const rows = await parseFile(file);
      if (!rows.length) { setParseError("File is empty."); return; }
      if (rows.length > 200) { setParseError("Max 200 rows."); return; }
      setPreviewRows(validateRows(rows)); setBulkStep("preview");
    } catch (err) { setParseError((err as Error).message); }
  }

  async function handleBulkSubmit() {
    setSubmitting(true);
    const payload = previewRows.filter((r) => r._valid)
      .map((r) => ({ full_name: r.full_name, email: r.email, password: r.password, usn: r.usn, cgpa: parseFloat(r.cgpa) }));
    const res = await fetch(`/api/faculty/sections/${sectionId}/students/bulk`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json() as { results: BulkStudentResult[]; successCount: number; errorCount: number };
    setBulkResults(data.results ?? []); setBulkSummary({ success: data.successCount ?? 0, error: data.errorCount ?? 0 });
    setBulkStep("results"); setSubmitting(false);
    if ((data.successCount ?? 0) > 0) {
      // Re-fetch students
      const fr = await fetch(`/api/admin/students?sectionId=${sectionId}`);
      if (fr.ok) {
        const fd = await fr.json() as { students: Array<{ id: string; usn: string; cgpa: number; section_id: string | null; github_url: string | null; profiles: { full_name: string; email: string } | null }> };
        setStudents((fd.students ?? []).map((s) => ({
          id: s.id, usn: s.usn, cgpa: s.cgpa, section_id: s.section_id, github_url: s.github_url,
          full_name: s.profiles?.full_name ?? "", email: s.profiles?.email ?? "",
        })));
      }
    }
  }

  function resetBulk() { setBulkStep("upload"); setPreviewRows([]); setFileName(null); setParseError(null); setBulkResults([]); setBulkSummary(null); }

  const validCount = previewRows.filter((r) => r._valid).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Actions bar */}
      {canManage && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-neutral-600">
            <strong>{students.length}</strong> students in {sectionLabel}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => { resetBulk(); setShowBulk(true); }}>
              <IconUpload size={13} /> Bulk Upload
            </Button>
            <Button variant="primary" size="sm"
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              onClick={() => { resetAdd(); setShowAdd(true); }}>
              + Add Student
            </Button>
          </div>
        </div>
      )}

      {/* Students list */}
      {students.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ border: "2px dashed #e5e7eb" }}>
          <IconUsers size={32} style={{ color: "#9ca3af", margin: "0 auto 8px" }} />
          <p className="text-sm text-neutral-500">No students in this section yet.</p>
          {canManage && <p className="text-xs text-neutral-400 mt-1">Click "+ Add Student" or use Bulk Upload.</p>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Student","USN","CGPA","GitHub",""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}
                  style={{ backgroundColor: i % 2 === 1 ? "#f9fafb" : "#fff", borderBottom: "1px solid #f3f4f6" }}>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelectedStudent(s)}
                      className="flex cursor-pointer items-center gap-3 text-left hover:underline">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: "#1e3a5f" }}>
                        {s.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{s.full_name}</p>
                        <p className="text-xs text-neutral-400">{s.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{s.usn}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: s.cgpa >= 7 ? "#f0fdf4" : "#fffbeb", color: s.cgpa >= 7 ? "#16a34a" : "#d97706" }}>
                      {s.cgpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.github_url
                      ? <a href={s.github_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs" style={{ color: "#1e3a5f" }}>
                          <IconGitHub size={12} /> View
                        </a>
                      : <span className="text-xs text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <button type="button" onClick={() => handleRemove(s.id, s.full_name)}
                        className="cursor-pointer text-xs text-red-500 hover:text-red-700">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student detail panel */}
      {selectedStudent && <StudentPanel student={selectedStudent} onClose={() => setSelectedStudent(null)} />}

      {/* ── Add student dialog ── */}
      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) setShowAdd(false); }}
        title={`Add Student to ${sectionLabel}`}
        description={`Creates a new student account in ${deptCode}.`}>
        <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
          <FormError message={addError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={addForm.full_name} required placeholder="John Doe"
              onChange={(e) => setAddForm((p) => ({ ...p, full_name: e.target.value }))} />
            <Input label="Email" type="email" value={addForm.email} required placeholder="student@college.edu"
              onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} />
            <Input label="Password" type="password" value={addForm.password} required placeholder="Min. 8 characters"
              onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} />
            <Input label="USN (10 alphanumeric)" value={addForm.usn} required placeholder="1CS21CS001" maxLength={10}
              onChange={(e) => setAddForm((p) => ({ ...p, usn: e.target.value.toUpperCase() }))} />
            <Input label="CGPA (0–10)" type="number" value={addForm.cgpa} required
              placeholder="8.50" min={0} max={10} step={0.01}
              onChange={(e) => setAddForm((p) => ({ ...p, cgpa: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={addLoading}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}>
              Create &amp; Add to Section
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── Bulk upload dialog ── */}
      <Dialog open={showBulk} onOpenChange={(o) => { if (!o) setShowBulk(false); }}
        title={`Bulk Upload — ${sectionLabel}`} size="xl"
        description="Download the template, fill it in, then upload.">

        {bulkStep === "upload" && (
          <div className="flex flex-col gap-5">
            {/* Template info */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: "#0369a1" }}>
                <IconDownload size={14} /> Download Template
              </p>
              <p className="mb-3 text-xs text-neutral-600">
                All students will be placed in <strong>{sectionLabel}</strong> ({deptCode}).
              </p>
              <Button variant="secondary" size="sm" style={{ borderColor: "#0369a1", color: "#0369a1" }}
                onClick={() => {
                  const wb = XLSX.utils.book_new();
                  const data: string[][] = [
                    [...HEADERS],
                    ["Alice Kumar", "alice@college.edu", "Password@123", "1CS21CS001", "8.50"],
                    ["Bob Raj",    "bob@college.edu",   "Password@123", "1CS21CS002", "7.80"],
                  ];
                  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Students");
                  XLSX.writeFile(wb, "student_template.xlsx");
                }}>
                <IconDownload size={13} /> Download Template (.xlsx)
              </Button>
              <div className="mt-3 flex flex-wrap gap-1">
                {HEADERS.map((h) => (
                  <span key={h} className="rounded px-2 py-0.5 font-mono text-xs"
                    style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>{h}</span>
                ))}
              </div>
            </div>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-xl p-8 text-center transition-all"
              style={{ border: `2px dashed ${dragging ? "#1e3a5f" : "#d1d5db"}`, backgroundColor: dragging ? "#eff6ff" : "#fafafa" }}>
              <div className="mb-2 flex justify-center">
                <IconFolder size={36} style={{ color: dragging ? "#1e3a5f" : "#9ca3af" }} />
              </div>
              <p className="text-sm font-medium text-neutral-700">Drop .xlsx or .csv here</p>
              <p className="mt-0.5 text-xs text-neutral-400">or click to browse</p>
              {fileName && (
                <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium" style={{ color: "#1e3a5f" }}>
                  <IconCheck size={12} /> {fileName}
                </p>
              )}
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
            </div>
            {parseError && <p className="text-xs text-red-600">{parseError}</p>}
          </div>
        )}

        {bulkStep === "preview" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
                style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                <IconCheck size={13} /> {validCount} valid
              </span>
              {previewRows.length - validCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                  <IconAlertCircle size={13} /> {previewRows.length - validCount} with errors (skipped)
                </span>
              )}
              <button type="button" onClick={() => { setBulkStep("upload"); setPreviewRows([]); setFileName(null); }}
                className="cursor-pointer text-xs text-neutral-500 underline hover:text-neutral-800">Change file</button>
            </div>
            <div className="overflow-auto rounded-xl" style={{ border: "1px solid #e5e7eb", maxHeight: 300 }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Row","Name","Email","USN","CGPA","Status"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r) => (
                    <tr key={r.row} style={{ backgroundColor: r._valid ? "#fff" : "#fff5f5", borderBottom: "1px solid #f3f4f6" }}>
                      <td className="px-3 py-2 text-xs text-neutral-400">{r.row}</td>
                      <td className="px-3 py-2 text-sm font-medium">{r.full_name}</td>
                      <td className="px-3 py-2 text-xs text-neutral-600">{r.email}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.usn}</td>
                      <td className="px-3 py-2 text-xs">{r.cgpa}</td>
                      <td className="px-3 py-2">
                        {r._valid
                          ? <span className="flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}><IconCheck size={11}/> Ready</span>
                          : <span className="flex items-center gap-1 text-xs text-red-600" title={r._errors.join(", ")}><IconAlertCircle size={11}/> {r._errors[0]}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setShowBulk(false)}>Cancel</Button>
              <Button variant="primary" type="button" isLoading={submitting} disabled={validCount === 0}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }} onClick={handleBulkSubmit}>
                <IconUpload size={13} /> Upload {validCount} Student{validCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}

        {bulkStep === "results" && bulkSummary && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{bulkSummary.success}</p>
                <p className="mt-1 text-sm text-neutral-600">Created</p>
              </div>
              <div className="rounded-xl p-4 text-center"
                style={{ backgroundColor: bulkSummary.error ? "#fef2f2" : "#f9fafb", border: `1px solid ${bulkSummary.error ? "#fecaca" : "#e5e7eb"}` }}>
                <p className="text-3xl font-bold" style={{ color: bulkSummary.error ? "#dc2626" : "#9ca3af" }}>{bulkSummary.error}</p>
                <p className="mt-1 text-sm text-neutral-600">Failed</p>
              </div>
            </div>
            <div className="overflow-auto rounded-xl" style={{ border: "1px solid #e5e7eb", maxHeight: 250 }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Row","Email","Result"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((r) => (
                    <tr key={r.row} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: r.status === "success" ? "#fff" : "#fff5f5" }}>
                      <td className="px-3 py-2 text-xs text-neutral-400">{r.row}</td>
                      <td className="px-3 py-2 text-xs">{r.email}</td>
                      <td className="px-3 py-2">
                        {r.status === "success"
                          ? <span className="flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}><IconCheck size={11}/> Created</span>
                          : <span className="flex items-center gap-1 text-xs text-red-600"><IconAlertCircle size={11}/> {r.error}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              {bulkSummary.error > 0 && (
                <Button variant="secondary" type="button" onClick={resetBulk}>Upload more</Button>
              )}
              <Button variant="primary" type="button" onClick={() => setShowBulk(false)}>Done</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
