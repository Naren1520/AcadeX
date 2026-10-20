"use client";

import { DataTable } from "@/components/tables/DataTable";
import Link from "next/link";

export type StudentRow = {
  id: string;
  usn: string;
  cgpa: number;
  profiles: { full_name: string; email: string } | null;
  departments: { name: string; code: string } | null;
};

export function StudentsTable({ students }: { students: StudentRow[] }) {
  const columns = [
    { key: "usn", header: "USN", sortable: true },
    { key: "full_name", header: "Name", render: (r: StudentRow) => r.profiles?.full_name ?? "—" },
    { key: "email", header: "Email", render: (r: StudentRow) => <span className="text-xs">{r.profiles?.email ?? "—"}</span> },
    { key: "department", header: "Department", render: (r: StudentRow) => r.departments?.code ?? "—" },
    { key: "cgpa", header: "CGPA", sortable: true, render: (r: StudentRow) => r.cgpa.toFixed(2) },
    {
      key: "actions",
      header: "",
      render: (r: StudentRow) => (
        <Link href={`/admin/students/${r.id}`} className="text-xs" style={{ color: "#1e3a5f" }}>
          Manage →
        </Link>
      ),
    },
  ];

  return (
    <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students found."
        caption="All students"
      />
    </div>
  );
}
