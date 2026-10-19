import { getUserProfile } from "@/lib/supabase/helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { Shell } from "@/components/layout/Shell";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/tables/DataTable";
import { redirect } from "next/navigation";
import { facultyNav } from "@/config/navigation";
import Link from "next/link";

export default async function FacultyStudentsPage() {
  const supabase = await getSupabaseServerClient();
  try { await requireRole(supabase, ["faculty"]); } catch { redirect("/login"); }

  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getUserProfile(supabase, user!.id);

  // Get departments the faculty is assigned to
  const { data: assignmentsData } = await supabase
    .from("faculty_assignments")
    .select("department_id")
    .eq("faculty_id", user!.id);

  const assignments = (assignmentsData ?? []) as { department_id: string }[];
  const deptIds = [...new Set(assignments.map((a) => a.department_id))];

  const { data: students } = deptIds.length > 0
    ? await supabase
        .from("students")
        .select("id, usn, cgpa, github_url, profiles(full_name, email), departments(name)")
        .in("department_id", deptIds)
        .order("usn")
    : { data: [] };

  type StudentRow = {
    id: string;
    usn: string;
    cgpa: number;
    github_url: string | null;
    profiles: { full_name: string; email: string } | null;
    departments: { name: string } | null;
  };

  const columns = [
    { key: "usn", header: "USN", sortable: true },
    { key: "full_name", header: "Name", render: (r: StudentRow) => r.profiles?.full_name ?? "â€”" },
    { key: "department", header: "Department", render: (r: StudentRow) => r.departments?.name ?? "â€”" },
    { key: "cgpa", header: "CGPA", sortable: true, render: (r: StudentRow) => r.cgpa.toFixed(2) },
    { key: "github_url", header: "GitHub", render: (r: StudentRow) =>
      r.github_url
        ? <a href={r.github_url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "#1e3a5f" }}>View</a>
        : <span className="text-xs text-neutral-400">â€”</span>
    },
    { key: "actions", header: "", render: (r: StudentRow) => (
      <Link href={`/portal/faculty/students/${r.id}`} className="text-xs" style={{ color: "#1e3a5f" }}>
        View â†’
      </Link>
    )},
  ];

  return (
    <Shell
      role="faculty"
      navItems={facultyNav}
      breadcrumbs={[{ label: "Faculty", href: "/portal/faculty" }, { label: "Students" }]}
      userFullName={profile?.full_name}
    >
      <PageWrapper title="Students" description="Students in your assigned departments.">
        <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
          <DataTable
            columns={columns}
            data={(students ?? []) as unknown as StudentRow[]}
            emptyMessage="No students found in your assigned departments."
            caption="Students list"
          />
        </div>
      </PageWrapper>
    </Shell>
  );
}


