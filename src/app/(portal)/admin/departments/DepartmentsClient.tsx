"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";

interface Department {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface Props { initialDepartments: Department[] }

export function DepartmentsClient({ initialDepartments }: Props) {
  const router = useRouter();
  const [departments, setDepartments] = useState(initialDepartments);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    const data = await res.json() as { department?: Department; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to create department."); setIsLoading(false); return; }
    setDepartments((prev) => [...prev, data.department!]);
    setShowCreate(false); setName(""); setCode(""); setIsLoading(false);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this department?")) return;
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    if (res.ok) {
      setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, is_active: false } : d));
    }
  }

  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "code", header: "Code" },
    {
      key: "is_active", header: "Status",
      render: (row: Department) => (
        <Badge variant={row.is_active ? "approved" : "neutral"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions", header: "Actions",
      render: (row: Department) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/departments/${row.id}`)}>
            Manage →
          </Button>
          {row.is_active && (
            <Button variant="ghost" size="sm" onClick={() => handleDeactivate(row.id)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          Add Department
        </Button>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <DataTable columns={columns} data={departments} emptyMessage="No departments found." caption="Departments list" />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Department">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input label="Department Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Information Science  and Engineering" />
          <Input label="Department Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="CSE" maxLength={20} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
