"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { IconUpload } from "@/components/ui/Icon";
import { FacultyBulkUpload } from "./FacultyBulkUpload";
import type { SectionWithPermission } from "./page";

interface Props {
  sections: SectionWithPermission[];
}

type StudentInSection = { id: string; usn: string; full_name: string; email: string; cgpa: number };

export function FacultySectionsClient({ sections }: Props) {
  const [expanded, setExpanded]               = useState<string | null>(null);
  const [sectionStudents, setSectionStudents] = useState<Record<string, StudentInSection[]>>({});
  const [loadingSection, setLoadingSection]   = useState<string | null>(null);

  // Bulk upload dialog
  const [bulkSection, setBulkSection] = useState<SectionWithPermission | null>(null);
  // Create student dialog
  const [addingTo, setAddingTo]       = useState<SectionWithPermission | null>(null);
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [usn, setUsn]                 = useState("");
  const [cgpa, setCgpa]               = useState("");
  const [addError, setAddError]       = useState<string | null>(null);
  const [addLoading, setAddLoading]   = useState(false);

  function resetForm() {
    setFullName(""); setEmail(""); setPassword(""); setUsn(""); setCgpa(""); setAddError(null);
  }

  // Load students for a section from the server
  async function loadStudents(sectionId: string) {
    if (sectionStudents[sectionId] !== undefined) return;
    setLoadingSection(sectionId);
    // use admin students API filtered by section
    const res = await fetch(`/api/admin/students?sectionId=${sectionId}`);
    if (res.ok) {
      const data = await res.json() as { students: Array<{
        id: string; usn: string; cgpa: number;
        profiles: { full_name: string; email: string } | null;
      }> };
      setSectionStudents((prev) => ({
        ...prev,
        [sectionId]: (data.students ?? []).map((s) => ({
          id: s.id, usn: s.usn, cgpa: s.cgpa,
          full_name: s.profiles?.full_name ?? "",
          email:     s.profiles?.email    ?? "",
        })),
      }));
    } else {
      setSectionStudents((prev) => ({ ...prev, [sectionId]: [] }));
    }
    setLoadingSection(null);
  }

  function toggleExpand(sectionId: string) {
    if (expanded === sectionId) { setExpanded(null); return; }
    setExpanded(sectionId);
    loadStudents(sectionId);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addingTo) return;
    setAddLoading(true); setAddError(null);

    const res = await fetch(`/api/faculty/sections/${addingTo.section_id}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        usn,
        cgpa: parseFloat(cgpa),
      }),
    });
    const data = await res.json() as { student?: StudentInSection; error?: string };
    if (!res.ok) { setAddError(data.error ?? "Failed to create student."); setAddLoading(false); return; }

    // Add to local state
    setSectionStudents((prev) => ({
      ...prev,
      [addingTo.section_id]: [...(prev[addingTo.section_id] ?? []), data.student!],
    }));
    setAddingTo(null); resetForm(); setAddLoading(false);
  }

  async function handleRemove(sectionId: string, studentId: string, name: string) {
    if (!confirm(`Remove ${name} from this section?`)) return;
    const res = await fetch(
      `/api/faculty/sections/${sectionId}/students?student_id=${studentId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setSectionStudents((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] ?? []).filter((s) => s.id !== studentId),
      }));
    }
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
        style={{ border: "2px dashed #e5e7eb" }}>
        You have no section assignments yet. Contact an admin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((sec) => {
        const isExpanded = expanded === sec.section_id;
        const students   = sectionStudents[sec.section_id] ?? [];

        return (
          <div key={sec.section_id} className="overflow-hidden rounded-xl"
            style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>

            {/* ── Section header ── */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ backgroundColor: "#f9fafb", borderBottom: isExpanded ? "1px solid #e5e7eb" : undefined }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{sec.section_label}</span>
                  <span className="text-xs text-neutral-500">{sec.dept_name} ({sec.dept_code})</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {sectionStudents[sec.section_id]?.length ?? sec.student_count} students
                  </span>
                  <Badge variant={sec.can_manage_students ? "approved" : "neutral"}>
                    {sec.can_manage_students ? "Can add students" : "View only"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sec.can_manage_students && isExpanded && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setBulkSection(sec)}
                    >
                      <IconUpload size={13} />
                      Bulk Upload
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                      onClick={() => { resetForm(); setAddingTo(sec); }}
                    >
                      + Add Student
                    </Button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => toggleExpand(sec.section_id)}
                  className="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-200"
                  style={{ backgroundColor: "#e5e7eb", color: "#374151" }}
                >
                  {isExpanded ? "Collapse" : "View Students"}
                </button>
              </div>
            </div>

            {/* ── Students list ── */}
            {isExpanded && (
              <div>
                {loadingSection === sec.section_id ? (
                  <div className="px-5 py-6 text-center text-sm text-neutral-400">Loading…</div>
                ) : students.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-neutral-400">
                    No students in this section yet.
                    {sec.can_manage_students && ' Click "+ Add Student" to create one.'}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {students.map((s) => (
                      <div key={s.id}
                        className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                          >
                            {s.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">
                              {s.full_name}
                              <span className="ml-2 font-mono text-xs font-normal text-neutral-400">
                                {s.usn}
                              </span>
                            </p>
                            <p className="text-xs text-neutral-500">
                              {s.email}&nbsp;·&nbsp;
                              <span style={{ color: "#16a34a" }}>CGPA {s.cgpa.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                        {sec.can_manage_students && (
                          <button
                            type="button"
                            onClick={() => handleRemove(sec.section_id, s.id, s.full_name)}
                            className="cursor-pointer rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Bulk upload dialog ── */}
      <Dialog
        open={!!bulkSection}
        onOpenChange={(o) => { if (!o) setBulkSection(null); }}
        title={`Bulk Upload Students — ${bulkSection?.section_label ?? ""}`}
        description="Download the template, fill it in, and upload to create multiple students at once."
        size="xl"
      >
        {bulkSection && (
          <FacultyBulkUpload
            section={bulkSection}
            onComplete={(count) => {
              // Invalidate cached students so next expand re-fetches
              setSectionStudents((prev) => {
                const next = { ...prev };
                delete next[bulkSection.section_id];
                return next;
              });
              setBulkSection(null);
            }}
            onClose={() => setBulkSection(null)}
          />
        )}
      </Dialog>

      {/* ── Create student dialog ── */}
      <Dialog
        open={!!addingTo}
        onOpenChange={(o) => { if (!o) { setAddingTo(null); resetForm(); } }}
        title={`Add Student to ${addingTo?.section_label ?? "Section"}`}
        description={`Creates a new student account and places them directly in this section (${addingTo?.dept_name ?? ""}).`}
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={addError} />

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="student@college.edu"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
          />
          <Input
            label="USN (10 alphanumeric characters)"
            value={usn}
            onChange={(e) => setUsn(e.target.value.toUpperCase())}
            required
            placeholder="1CS21CS001"
            maxLength={10}
          />
          <Input
            label="CGPA (0.00 – 10.00)"
            type="number"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            required
            placeholder="8.50"
            min={0}
            max={10}
            step={0.01}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" type="button"
              onClick={() => { setAddingTo(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={addLoading}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
            >
              Create &amp; Add to Section
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
