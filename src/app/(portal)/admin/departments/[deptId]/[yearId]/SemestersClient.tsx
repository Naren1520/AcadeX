"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { Semester } from "./page";

interface Props {
  deptId: string;
  deptCode: string;
  yearId: string;
  initialSemesters: Semester[];
}

export function SemestersClient({ deptId, deptCode, yearId, initialSemesters }: Props) {
  const router = useRouter();
  const [semesters, setSemesters] = useState(initialSemesters);
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, academic_year_id: yearId }),
    });
    const data = await res.json() as { semester?: { id: string; label: string; is_closed: boolean }; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create semester."); setIsLoading(false); return; }
    setSemesters((prev) => [...prev, { ...data.semester!, section_count: 0 }]);
    setShowAdd(false); setLabel(""); setIsLoading(false);
  }

  async function handleClose(semId: string, lbl: string) {
    if (!confirm(`Close semester "${lbl}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/semesters/${semId}/close`, { method: "PATCH" });
    if (res.ok) setSemesters((prev) => prev.map((s) => s.id === semId ? { ...s, is_closed: true } : s));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => { setLabel(""); setError(null); setShowAdd(true); }}>
          Add Semester
        </Button>
      </div>

      {semesters.length === 0 && (
        <div className="rounded-lg p-10 text-center text-sm text-neutral-500" style={{ border: "2px dashed #e5e7eb" }}>
          No semesters yet for <strong>{deptCode}</strong>. Add one to get started.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {semesters.map((sem) => (
          <div
            key={sem.id}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-md"
            style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
          >
            {/* Card top - clickable */}
            <button
              type="button"
              onClick={() => router.push(`/admin/departments/${deptId}/${yearId}/${sem.id}`)}
              className="w-full cursor-pointer px-5 py-4 text-left transition-colors hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-900">{sem.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {sem.section_count} section{sem.section_count !== 1 ? "s" : ""} &nbsp;·&nbsp; {deptCode}
                  </p>
                </div>
                <Badge variant={sem.is_closed ? "neutral" : "approved"}>
                  {sem.is_closed ? "Closed" : "Open"}
                </Badge>
              </div>
              <p className="mt-3 text-xs" style={{ color: "#1e3a5f" }}>
                View sections →
              </p>
            </button>

            {/* Card footer */}
            {!sem.is_closed && (
              <div
                className="flex justify-end px-4 py-2"
                style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#f9fafb" }}
              >
                <Button variant="ghost" size="sm" onClick={() => handleClose(sem.id, sem.label)}>
                  Close Semester
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd} title="Add Semester">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input
            label="Semester Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Odd 2024"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
