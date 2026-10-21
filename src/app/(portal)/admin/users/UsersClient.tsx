"use client";

import { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { BulkUploadClient } from "./BulkUploadClient";
import { IconUpload } from "@/components/ui/Icon";
import type { UserRow, DepartmentOption, SectionOption } from "./page";

interface Props {
  initialUsers: UserRow[];
  departments: DepartmentOption[];
  sections: SectionOption[];
}

type RoleTab = "faculty" | "student";

export function UsersClient({ initialUsers, departments, sections }: Props) {
  const [users, setUsers]           = useState(initialUsers);
  const [showCreate, setShowCreate]   = useState(false);
  const [showBulk, setShowBulk]       = useState(false);
  const [tab, setTab]                 = useState<RoleTab>("faculty");
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // shared fields
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  // student-only
  const [usn, setUsn]             = useState("");
  const [deptId, setDeptId]       = useState("");
  const [sectionId, setSectionId] = useState("");
  const [cgpa, setCgpa]           = useState("");

  function resetForm() {
    setFullName(""); setEmail(""); setPassword("");
    setUsn(""); setDeptId(""); setSectionId(""); setCgpa("");
    setError(null);
  }

  function handleOpen() { resetForm(); setShowCreate(true); }
  function handleClose() { setShowCreate(false); resetForm(); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      email, password, role: tab, full_name: fullName,
    };
    if (tab === "student") {
      body.usn = usn;
      body.department_id = deptId;
      body.section_id = sectionId || undefined;
      body.cgpa = parseFloat(cgpa);
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { user?: UserRow; error?: string };

    if (!res.ok) {
      setError(data.error ?? "Failed to create user.");
      setIsLoading(false);
      return;
    }

    setUsers((prev) => [data.user!, ...prev]);
    handleClose();
    setIsLoading(false);
  }

  // Sections filtered by selected department
  const filteredSections = deptId
    ? sections.filter((s) => s.department_id === deptId)
    : sections;

  const columns = [
    {
      key: "full_name", header: "Name", sortable: true,
      render: (r: UserRow) => <span className="font-medium">{r.full_name}</span>,
    },
    { key: "email", header: "Email", render: (r: UserRow) => <span className="text-xs">{r.email}</span> },
    {
      key: "role", header: "Role",
      render: (r: UserRow) => (
        <Badge variant={r.role === "faculty" ? "approved" : "pending"}>
          {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at", header: "Created",
      render: (r: UserRow) => new Date(r.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulk(true)}>
            <IconUpload size={14} />
            Bulk Upload
          </Button>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpen}>
          + Add User
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found. Create faculty and students using the button above."
          caption="All users"
        />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add User">
        {/* Role tabs */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => { setTab("faculty"); setError(null); }}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: tab === "faculty" ? "#1e3a5f" : "#e5e7eb",
              backgroundColor: tab === "faculty" ? "#1e3a5f" : "transparent",
              color: tab === "faculty" ? "#fff" : "#374151",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => { setTab("student"); setError(null); }}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: tab === "student" ? "#1e3a5f" : "#e5e7eb",
              backgroundColor: tab === "student" ? "#1e3a5f" : "transparent",
              color: tab === "student" ? "#fff" : "#374151",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Student
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder={tab === "faculty" ? "Dr. Jane Smith" : "John Doe"}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={tab === "faculty" ? "faculty@college.edu" : "student@college.edu"}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
          />

          {/* Student-only fields */}
          {tab === "student" && (
            <>
              <Input
                label="USN (10 alphanumeric characters)"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                required
                placeholder="1CS21CS001"
                maxLength={10}
              />

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  Department <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={deptId}
                  onChange={(e) => { setDeptId(e.target.value); setSectionId(""); }}
                  required
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    color: "#111827",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="">Select department…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  Section <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  disabled={!deptId}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    color: "#111827",
                    backgroundColor: deptId ? "#fff" : "#f9fafb",
                  }}
                >
                  <option value="">No section</option>
                  {filteredSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                      {s.semesters ? ` — ${s.semesters.label} (${s.semesters.academic_years?.label})` : ""}
                    </option>
                  ))}
                </select>
              </div>

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
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Create {tab === "faculty" ? "Faculty" : "Student"}
            </Button>
          </div>
        </form>
      </Dialog>
      {/* Bulk upload dialog */}
      <Dialog
        open={showBulk}
        onOpenChange={setShowBulk}
        title="Bulk Upload Users"
        description="Upload an Excel or CSV file to create multiple faculty or students at once."
        size="xl"
      >
        <BulkUploadClient
          departments={departments}
          sections={sections}
          onComplete={(newUsers) => setUsers((prev) => [...newUsers, ...prev])}
          onClose={() => setShowBulk(false)}
        />
      </Dialog>
    </div>
  );
}
