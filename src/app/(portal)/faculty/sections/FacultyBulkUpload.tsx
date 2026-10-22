"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/forms/FormError";
import {
  IconDownload, IconFolder, IconUpload,
  IconCheck, IconAlertCircle,
} from "@/components/ui/Icon";
import type { SectionWithPermission } from "./page";
import type { BulkStudentResult } from "@/app/api/faculty/sections/[sectionId]/students/bulk/route";

// ── Template headers ──────────────────────────────────────────
const HEADERS = ["full_name", "email", "password", "usn", "cgpa"] as const;

type ParsedRow = Record<string, string>;

interface PreviewRow {
  row: number;
  full_name: string;
  email: string;
  password: string;
  usn: string;
  cgpa: string;
  _valid: boolean;
  _errors: string[];
}

interface Props {
  section: SectionWithPermission;
  onComplete: (count: number) => void;
  onClose: () => void;
}

// ── Template download ─────────────────────────────────────────
function downloadTemplate() {
  const wb   = XLSX.utils.book_new();
  const data: string[][] = [
    [...HEADERS],
    ["Alice Kumar", "alice@college.edu", "Password@123", "1CS21CS001", "8.50"],
    ["Bob Raj",    "bob@college.edu",   "Password@123", "1CS21CS002", "7.80"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Students");
  XLSX.writeFile(wb, "student_bulk_template.xlsx");
}

// ── File parser ───────────────────────────────────────────────
function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: "array" });
        const rows = XLSX.utils.sheet_to_json<ParsedRow>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        resolve(rows);
      } catch { reject(new Error("Could not parse file. Use .xlsx or .csv.")); }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

// ── Row validator ─────────────────────────────────────────────
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
    if (!r.full_name)                                     errors.push("full_name required");
    if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push("invalid email");
    if (!r.password || r.password.length < 8)             errors.push("password ≥ 8 chars");
    if (!r.usn || !/^[A-Za-z0-9]{10}$/.test(r.usn))      errors.push("USN must be 10 alphanumeric chars");
    const cgpaNum = parseFloat(r.cgpa);
    if (r.cgpa === "" || isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) errors.push("CGPA 0–10");
    r._errors = errors;
    r._valid  = errors.length === 0;
    return r;
  });
}

// ── Component ─────────────────────────────────────────────────
export function FacultyBulkUpload({ section, onComplete, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep]           = useState<"upload" | "preview" | "results">("upload");
  const [dragging, setDragging]   = useState(false);
  const [fileName, setFileName]   = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [results, setResults]     = useState<BulkStudentResult[]>([]);
  const [summary, setSummary]     = useState<{ success: number; error: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function processFile(file: File) {
    setParseError(null); setFileName(file.name);
    try {
      const rows = await parseFile(file);
      if (rows.length === 0) { setParseError("File is empty."); return; }
      if (rows.length > 200) { setParseError("Max 200 rows per upload."); return; }
      setPreviewRows(validateRows(rows));
      setStep("preview");
    } catch (err) { setParseError((err as Error).message); }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = previewRows
      .filter((r) => r._valid)
      .map((r) => ({ full_name: r.full_name, email: r.email, password: r.password, usn: r.usn, cgpa: parseFloat(r.cgpa) }));

    const res  = await fetch(`/api/faculty/sections/${section.section_id}/students/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json() as { results: BulkStudentResult[]; successCount: number; errorCount: number };
    setResults(data.results ?? []);
    setSummary({ success: data.successCount ?? 0, error: data.errorCount ?? 0 });
    setStep("results");
    setSubmitting(false);
    if ((data.successCount ?? 0) > 0) onComplete(data.successCount);
  }

  const validCount   = previewRows.filter((r) => r._valid).length;
  const invalidCount = previewRows.length - validCount;

  // ── STEP: Upload ──────────────────────────────────────────────
  if (step === "upload") return (
    <div className="flex flex-col gap-5">
      {/* Template */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}>
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: "#0369a1" }}>
          <IconDownload size={14} /> Download Template
        </p>
        <p className="mb-3 text-xs text-neutral-600">
          Fill in the template and upload it back. All students will be placed in&nbsp;
          <strong>{section.section_label}</strong>.
        </p>
        <Button variant="secondary" size="sm" onClick={downloadTemplate}
          style={{ borderColor: "#0369a1", color: "#0369a1" }}>
          <IconDownload size={13} /> Download Student Template (.xlsx)
        </Button>
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-neutral-500">Required columns:</p>
          <div className="flex flex-wrap gap-1">
            {HEADERS.map((h) => (
              <span key={h} className="rounded px-2 py-0.5 font-mono text-xs"
                style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>{h}</span>
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
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl p-8 text-center transition-all"
          style={{ border: `2px dashed ${dragging ? "#1e3a5f" : "#d1d5db"}`, backgroundColor: dragging ? "#eff6ff" : "#fafafa" }}
        >
          <div className="mb-2 flex justify-center">
            <IconFolder size={36} style={{ color: dragging ? "#1e3a5f" : "#9ca3af" }} />
          </div>
          <p className="text-sm font-medium text-neutral-700">Drop your .xlsx or .csv here</p>
          <p className="mt-0.5 text-xs text-neutral-400">or click to browse</p>
          {fileName && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium" style={{ color: "#1e3a5f" }}>
              <IconCheck size={12} /> {fileName}
            </p>
          )}
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
        </div>
        <FormError message={parseError} />
      </div>
    </div>
  );

  // ── STEP: Preview ─────────────────────────────────────────────
  if (step === "preview") return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
          style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
          <IconCheck size={13} /> {validCount} valid
        </span>
        {invalidCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            <IconAlertCircle size={13} /> {invalidCount} with errors (skipped)
          </span>
        )}
        <button type="button" onClick={() => { setStep("upload"); setPreviewRows([]); setFileName(null); }}
          className="cursor-pointer text-xs text-neutral-500 underline hover:text-neutral-800">
          Change file
        </button>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb", maxHeight: 320, overflowY: "auto" }}>
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
                <td className="px-3 py-2 text-sm font-medium text-neutral-800">{r.full_name || <span className="text-red-400">—</span>}</td>
                <td className="px-3 py-2 text-xs text-neutral-600">{r.email}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.usn}</td>
                <td className="px-3 py-2 text-xs">{r.cgpa}</td>
                <td className="px-3 py-2">
                  {r._valid
                    ? <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}><IconCheck size={11}/> Ready</span>
                    : <span className="flex items-center gap-1 text-xs text-red-600" title={r._errors.join(", ")}><IconAlertCircle size={11}/> {r._errors[0]}{r._errors.length > 1 ? ` +${r._errors.length - 1}` : ""}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="button" isLoading={submitting} disabled={validCount === 0} onClick={handleSubmit}
          style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}>
          <IconUpload size={13} /> Upload {validCount} Student{validCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );

  // ── STEP: Results ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{summary?.success}</p>
          <p className="mt-1 text-sm text-neutral-600">Created successfully</p>
        </div>
        <div className="rounded-xl p-4 text-center"
          style={{ backgroundColor: summary?.error ? "#fef2f2" : "#f9fafb", border: `1px solid ${summary?.error ? "#fecaca" : "#e5e7eb"}` }}>
          <p className="text-3xl font-bold" style={{ color: summary?.error ? "#dc2626" : "#9ca3af" }}>{summary?.error}</p>
          <p className="mt-1 text-sm text-neutral-600">Failed</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb", maxHeight: 280, overflowY: "auto" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Row","Email","Result"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.row} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: r.status === "success" ? "#fff" : "#fff5f5" }}>
                <td className="px-3 py-2 text-xs text-neutral-400">{r.row}</td>
                <td className="px-3 py-2 text-xs text-neutral-700">{r.email}</td>
                <td className="px-3 py-2">
                  {r.status === "success"
                    ? <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}><IconCheck size={11}/> Created</span>
                    : <span className="flex items-center gap-1 text-xs text-red-600"><IconAlertCircle size={11}/> {r.error}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        {(summary?.error ?? 0) > 0 && (
          <Button variant="secondary" type="button"
            onClick={() => { setStep("upload"); setResults([]); setSummary(null); setFileName(null); setPreviewRows([]); }}>
            Upload more
          </Button>
        )}
        <Button variant="primary" type="button" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
