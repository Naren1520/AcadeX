"use client";

import { DataTable } from "@/components/tables/DataTable";
import Link from "next/link";

export type StudentRow = {
  id: string;
  usn: string;
  cgpa: number;
  github_url: string | null;
  profiles: { full_name: string; email: string } | null;
  departments: { name: string } | null;
};

export function StudentsTable({ students }: { students: StudentRow[] }) {
  const columns = [
    { key: "usn", header: "USN", sortable: true },
    { key: "full_name", header: "Name", render: (r: StudentRow) => r.profiles?.full_name ?? "-" },
    { key: "department", header: "Department", render: (r: StudentRow) => r.departments?.name ?? "-" },
    { key: "cgpa", header: "CGPA", sortable: true, render: (r: StudentRow) => r.cgpa.toFixed(2) },
    {
      key: "github_url",
      header: "GitHub",
      render: (r: StudentRow) =>
        r.github_url ? (
          <a href={r.github_url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "#1e3a5f" }}>
            View
          </a>
        ) : (
          <span className="text-xs text-neutral-400">-</span>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (r: StudentRow) => (
        <Link href={`/faculty/students/${r.id}`} className="text-xs" style={{ color: "#1e3a5f" }}>
          View →
        </Link>
      ),
    },
  ];

  return (
    <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students found in your assigned departments."
        caption="Students list"
      />
    </div>
  );
}
