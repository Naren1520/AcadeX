"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import type { Section } from "./page";

interface Props {
  deptId: string;
  deptCode: string;
  yearId: string;
  semId: string;
  semLabel: string;
  isClosed: boolean;
  initialSections: Section[];
}

export function SectionsClient({
  deptId, deptCode, yearId, semId, semLabel, isClosed, initialSections,
}: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, semester_id: semId, department_id: deptId }),
    });
    const data = await res.json() as { section?: { id: string; label: string }; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create section."); setIsLoading(false); return; }
    setSections((prev) => [...prev, { ...data.section!, student_count: 0, faculty_count: 0 }]);
    setShowAdd(false); setLabel(""); setIsLoading(false);
  }

  const basePath = `/admin/departments/${deptId}/${yearId}/${semId}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <strong>{deptCode}</strong> - <strong>{semLabel}</strong>
        </p>
        {!isClosed && (
          <Button variant="primary" size="sm" onClick={() => { setLabel(""); setError(null); setShowAdd(true); }}>
            Add Section
          </Button>
        )}
      </div>

      {sections.length === 0 && (
        <div className="rounded-lg p-10 text-center text-sm text-neutral-500" style={{ border: "2px dashed #e5e7eb" }}>
          No sections yet.{!isClosed && " Click \"Add Section\" to create one."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => router.push(`${basePath}/${sec.id}`)}
            className="cursor-pointer rounded-xl p-5 text-left transition-all hover:shadow-md"
            style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
          >
            {/* Section label */}
            <div className="mb-4 flex items-center justify-between">
              <span
                className="rounded-lg px-3 py-1 text-lg font-bold"
                style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}
              >
                {sec.label}
              </span>
              <span className="text-xs text-neutral-400">{deptCode}</span>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center rounded-lg px-4 py-2 flex-1" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <span className="text-2xl font-bold" style={{ color: "#16a34a" }}>{sec.student_count}</span>
                <span className="text-xs text-neutral-500">Students</span>
              </div>
              <div className="flex flex-col items-center rounded-lg px-4 py-2 flex-1" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <span className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{sec.faculty_count}</span>
                <span className="text-xs text-neutral-500">Faculty</span>
              </div>
            </div>

            <p className="mt-3 text-xs" style={{ color: "#1e3a5f" }}>
              Manage students &amp; faculty →
            </p>
          </button>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd} title="Add Section">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input
            label="Section Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="CS-A"
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
