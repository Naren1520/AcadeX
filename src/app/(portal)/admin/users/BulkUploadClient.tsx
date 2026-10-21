"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import {
  IconDownload, IconFolder, IconUpload, IconCheck,
  IconAlertCircle, IconFaculty, IconStudent,
} from "@/components/ui/Icon";
import { FormError } from "@/components/forms/FormError";
import type { DepartmentOption, SectionOption, UserRow } from "./page";
import type { BulkRowResult } from "@/app/api/admin/users/bulk/route";

// ── Template columns ──────────────────────────────────────────
const FACULTY_HEADERS = ["full_name", "email", "password"] as const;
const STUDENT_HEADERS = ["full_name", "email", "password", "usn", "department_code", "cgpa"] as const;

// ── Types ─────────────────────────────────────────────────────
type ParsedRow = Record<string, string>;

interface PreviewRow {
  row: number;
  full_name: string;
  email: string;
  password: string;
  role: "faculty" | "student";
  usn?: string;
  department_id?: string;
  department_code?: string;
  cgpa?: string;
  _valid: boolean;
  _errors: string[];
}

interface Props {
  departments: DepartmentOption[];
  sections: SectionOption[];
  onComplete: (newUsers: UserRow[]) => void;
  onClose: () => void;
}

// ── Template download ─────────────────────────────────────────
function downloadTemplate(type: "faculty" | "student", departments: DepartmentOption[]) {
  const wb = XLSX.utils.book_new();

  if (type === "faculty") {
    const data: string[][] = [
      [...FACULTY_HEADERS],
      ["Dr. Jane Smith", "jane@college.edu", "Password@123"],
      ["Prof. John Doe", "john@college.edu", "Password@123"],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Faculty");
  } else {
    const data: string[][] = [
      [...STUDENT_HEADERS],
      ["Alice Kumar", "alice@college.edu", "Password@123", "1CS21CS001", "CSE", "8.50"],
      ["Bob Raj",   "bob@college.edu",   "Password@123", "1CS21CS002", "CSE", "7.80"],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Students");

    // Second sheet: department reference
    const deptData = [
      ["department_code", "department_name"],
      ...departments.map((d) => [d.code, d.name]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deptData), "Departments (Reference)");
  }

  XLSX.writeFile(wb, `acadex_${type}_template.xlsx`);
}

// ── CSV / XLSX parser ─────────────────────────────────────────
function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: "" });
        resolve(rows);
      } catch {
        reject(new Error("Could not parse file. Make sure it's a valid .xlsx or .csv file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

// ── Row validator ─────────────────────────────────────────────
function validateRows(rows: ParsedRow[], role: "faculty" | "student", departments: DepartmentOption[]): PreviewRow[] {
  const deptByCode: Record<string, string> = {};
  departments.forEach((d) => { deptByCode[d.code.toUpperCase()] = d.id; });

  return rows.map((row, i) => {
    const errors: string[] = [];
    const r: PreviewRow = {
      row: i + 1,
      full_name: String(row.full_name ?? "").trim(),
      email:     String(row.email     ?? "").trim(),
      password:  String(row.password  ?? "").trim(),
      role,
      _valid: true,
      _errors: [],
    };

    if (!r.full_name) errors.push("full_name required");
    if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push("invalid email");
    if (!r.password || r.password.length < 8) errors.push("password ≥ 8 chars");

    if (role === "student") {
      r.usn             = String(row.usn ?? "").trim().toUpperCase();
      r.department_code = String(row.department_code ?? "").trim().toUpperCase();
      r.cgpa            = String(row.cgpa ?? "").trim();

      if (!r.usn || !/^[A-Za-z0-9]{10}$/.test(r.usn)) errors.push("USN must be 10 alphanumeric chars");

      const deptId = deptByCode[r.department_code];
      if (!r.department_code) {
        errors.push("department_code required");
      } else if (!deptId) {
        errors.push(`unknown department code "${r.department_code}"`);
      } else {
        r.department_id = deptId;
      }

      const cgpaNum = parseFloat(r.cgpa);
      if (r.cgpa === "" || isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        errors.push("CGPA must be 0–10");
      }
    }

    r._errors = errors;
    r._valid  = errors.length === 0;
    return r;
  });
}

// ── Main component ────────────────────────────────────────────
export function BulkUploadClient({ departments, onComplete, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole]           = useState<"faculty" | "student">("student");
  const [dragging, setDragging]   = useState(false);
  const [fileName, setFileName]   = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Steps: "upload" | "preview" | "results"
  const [step, setStep]           = useState<"upload" | "preview" | "results">("upload");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [results, setResults]     = useState<BulkRowResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary]     = useState<{ success: number; error: number } | null>(null);

  // ── File handling ─────────────────────────────────────────────
  async function processFile(file: File) {
    setParseError(null);
    setFileName(file.name);
    try {
      const rows = await parseFile(file);
      if (rows.length === 0) { setParseError("File is empty or has no data rows."); return; }
      if (rows.length > 200) { setParseError("Maximum 200 rows per upload."); return; }
      const preview = validateRows(rows, role, departments);
      setPreviewRows(preview);
      setStep("preview");
    } catch (err) {
      setParseError((err as Error).message);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    const validRows = previewRows.filter((r) => r._valid);
    const payload = validRows.map((r) => ({
      full_name:     r.full_name,
      email:         r.email,
      password:      r.password,
      role:          r.role,
      usn:           r.usn,
      department_id: r.department_id,
      cgpa:          r.cgpa ? parseFloat(r.cgpa) : undefined,
    }));

    const res  = await fetch("/api/admin/users/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json() as { results: BulkRowResult[]; successCount: number; errorCount: number };
    setResults(data.results ?? []);
    setSummary({ success: data.successCount ?? 0, error: data.errorCount ?? 0 });
    setStep("results");
    setSubmitting(false);

    // Tell parent about new users so table refreshes
    if (data.successCount > 0) {
      const newUsers: UserRow[] = (data.results ?? [])
        .filter((r) => r.status === "success")
        .map((r) => ({
          id:         "",
          role:       role as "faculty" | "student",
          full_name:  validRows.find((v) => v.email === r.email)?.full_name ?? "",
          email:      r.email,
          created_at: new Date().toISOString(),
        }));
      onComplete(newUsers);
    }
  }

  const validCount   = previewRows.filter((r) => r._valid).length;
  const invalidCount = previewRows.length - validCount;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── STEP: Upload ── */}
      {step === "upload" && (
        <>
          {/* Role selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Upload type</p>
            <div className="flex gap-2">
              {(["student", "faculty"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium transition-all"
                  style={{
                    border: "1px solid",
                    borderColor: role === r ? "#1e3a5f" : "#e5e7eb",
                    backgroundColor: role === r ? "#1e3a5f" : "#fff",
                    color: role === r ? "#fff" : "#374151",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {r === "student"
                      ? <IconStudent size={15} />
                      : <IconFaculty size={15} />}
                    {r === "student" ? "Students" : "Faculty"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Download templates */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "#0369a1" }}>
              <IconDownload size={15} />
              Download Template
            </p>
            <p className="mb-3 text-xs text-neutral-600">
              Fill in the template and upload it back. The file must match the column order exactly.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadTemplate(role, departments)}
                style={{ borderColor: "#0369a1", color: "#0369a1" }}
              >
                <IconDownload size={14} />
                Download {role === "student" ? "Student" : "Faculty"} Template (.xlsx)
              </Button>
            </div>
            {/* Column reference */}
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-neutral-500">Required columns:</p>
              <div className="flex flex-wrap gap-1">
                {(role === "faculty" ? FACULTY_HEADERS : STUDENT_HEADERS).map((h) => (
                  <span key={h} className="rounded px-2 py-0.5 font-mono text-xs" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Upload file</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl p-8 text-center transition-all"
              style={{
                border: `2px dashed ${dragging ? "#1e3a5f" : "#d1d5db"}`,
                backgroundColor: dragging ? "#eff6ff" : "#fafafa",
              }}
            >
              <div className="mb-3 flex justify-center">
                <IconFolder size={40} style={{ color: dragging ? "#1e3a5f" : "#9ca3af" }} />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                Drop your .xlsx or .csv file here
              </p>
              <p className="mt-1 text-xs text-neutral-400">or click to browse</p>
              {fileName && (
                <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium" style={{ color: "#1e3a5f" }}>
                  <IconCheck size={12} /> {fileName}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <FormError message={parseError} />
          </div>
        </>
      )}

      {/* ── STEP: Preview ── */}
      {step === "preview" && (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              <IconCheck size={13} /> {validCount} valid
            </span>
            {invalidCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                <IconAlertCircle size={13} /> {invalidCount} with errors (will be skipped)
              </span>
            )}
            <span className="text-xs text-neutral-400">{fileName}</span>
            <button
              type="button"
              onClick={() => { setStep("upload"); setPreviewRows([]); setFileName(null); }}
              className="cursor-pointer text-xs text-neutral-500 underline hover:text-neutral-800"
            >
              Change file
            </button>
          </div>

          {/* Preview table */}
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Row</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Email</th>
                    {role === "student" && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">USN</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Dept</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">CGPA</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r) => (
                    <tr
                      key={r.row}
                      style={{
                        backgroundColor: r._valid ? "#ffffff" : "#fff5f5",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <td className="px-3 py-2 text-xs text-neutral-400">{r.row}</td>
                      <td className="px-3 py-2 font-medium text-neutral-800">{r.full_name || <span className="text-red-400">—</span>}</td>
                      <td className="px-3 py-2 text-xs text-neutral-600">{r.email || <span className="text-red-400">—</span>}</td>
                      {role === "student" && (
                        <>
                          <td className="px-3 py-2 font-mono text-xs">{r.usn}</td>
                          <td className="px-3 py-2 text-xs">{r.department_code}</td>
                          <td className="px-3 py-2 text-xs">{r.cgpa}</td>
                        </>
                      )}
                      <td className="px-3 py-2">
                        {r._valid ? (
                          <span className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                            <IconCheck size={11} /> Ready
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600" title={r._errors.join(", ")}>
                            <IconAlertCircle size={11} /> {r._errors[0]}{r._errors.length > 1 ? ` +${r._errors.length - 1} more` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {validCount === 0 && (
            <p className="text-sm text-red-600">No valid rows to upload. Fix the errors and re-upload.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              type="button"
              isLoading={submitting}
              disabled={validCount === 0}
              onClick={handleSubmit}
            >
              <IconUpload size={14} />
              Upload {validCount} {role === "student" ? "Student" : "Faculty"}{validCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </>
      )}

      {/* ── STEP: Results ── */}
      {step === "results" && summary && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{summary.success}</p>
              <p className="mt-1 text-sm text-neutral-600">Created successfully</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: summary.error > 0 ? "#fef2f2" : "#f9fafb", border: `1px solid ${summary.error > 0 ? "#fecaca" : "#e5e7eb"}` }}>
              <p className="text-3xl font-bold" style={{ color: summary.error > 0 ? "#dc2626" : "#9ca3af" }}>{summary.error}</p>
              <p className="mt-1 text-sm text-neutral-600">Failed</p>
            </div>
          </div>

          {/* Per-row results */}
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Row</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.row} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: r.status === "success" ? "#fff" : "#fff5f5" }}>
                      <td className="px-3 py-2 text-xs text-neutral-400">{r.row}</td>
                      <td className="px-3 py-2 text-xs text-neutral-700">{r.email}</td>
                      <td className="px-3 py-2">
                        {r.status === "success" ? (
                          <span className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                            <IconCheck size={11} /> Created
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <IconAlertCircle size={11} /> {r.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {summary.error > 0 && (
              <Button variant="secondary" type="button" onClick={() => { setStep("upload"); setResults([]); setSummary(null); setFileName(null); setPreviewRows([]); }}>
                Upload more
              </Button>
            )}
            <Button variant="primary" type="button" onClick={onClose}>Done</Button>
          </div>
        </>
      )}
    </div>
  );
}
