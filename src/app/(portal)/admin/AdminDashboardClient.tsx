"use client";

import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  IconUsers, IconClipboard, IconFileText, IconArrowRight,
} from "@/components/ui/Icon";

interface Props {
  stats: {
    departments: number;
    students: number;
    faculty: number;
    sections: number;
    teams: number;
    proposals: number;
  };
  studentsByDept: { dept: string; count: number }[];
  facultyByDept: { dept: string; count: number }[];
  teamsByStatus: { name: string; value: number; color: string }[];
  proposalsByStatus: { name: string; value: number; color: string }[];
  registrationTrend: { month: string; students: number; faculty: number }[];
  sectionsBySemester: { semester: string; sections: number }[];
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? "#fff" }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, border, href }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; border: string; href: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-4 rounded-2xl px-5 py-5 transition-all hover:shadow-md no-underline"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}22`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
      </div>
    </Link>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <p className="mb-4 text-sm font-semibold text-neutral-700">{title}</p>
      {children}
    </div>
  );
}

function EmptyChart({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center text-sm text-neutral-400" style={{ height }}>
      No data yet
    </div>
  );
}

export function AdminDashboardClient({
  stats, studentsByDept, facultyByDept, teamsByStatus,
  proposalsByStatus, registrationTrend, sectionsBySemester,
}: Props) {
  const statCards = [
    { label: "Departments",  value: stats.departments, icon: <IconClipboard size={22} />, color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe", href: "/admin/departments" },
    { label: "Students",     value: stats.students,    icon: <IconUsers size={22} />,     color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", href: "/admin/students" },
    { label: "Faculty",      value: stats.faculty,     icon: <IconUsers size={22} />,     color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", href: "/admin/users" },
    { label: "Sections",     value: stats.sections,    icon: <IconClipboard size={22} />, color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", href: "/admin/sections" },
    { label: "Teams",        value: stats.teams,       icon: <IconUsers size={22} />,     color: "#d97706", bg: "#fffbeb", border: "#fde68a", href: "/admin/faculty-assignments" },
    { label: "Proposals",    value: stats.proposals,   icon: <IconFileText size={22} />,  color: "#dc2626", bg: "#fef2f2", border: "#fecaca", href: "/admin/faculty-assignments" },
  ];

  const hasStudentsByDept   = studentsByDept.some((d) => d.count > 0);
  const hasFacultyByDept    = facultyByDept.some((d) => d.count > 0);
  const hasTeamStatus       = teamsByStatus.some((d) => d.value > 0);
  const hasProposalStatus   = proposalsByStatus.some((d) => d.value > 0);
  const hasRegistration     = registrationTrend.some((d) => d.students > 0 || d.faculty > 0);
  const hasSectionsBySem    = sectionsBySemester.some((d) => d.sections > 0);

  const quickActions = [
    { label: "Manage Departments",  href: "/admin/departments",        color: "#1e3a5f", bg: "#eff6ff" },
    { label: "Academic Years",      href: "/admin/academic-years",     color: "#0369a1", bg: "#f0f9ff" },
    { label: "Assign Faculty",      href: "/admin/faculty-assignments", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Manage Users",        href: "/admin/users",              color: "#16a34a", bg: "#f0fdf4" },
    { label: "Students",            href: "/admin/students",           color: "#d97706", bg: "#fffbeb" },
    { label: "Audit Logs",          href: "/admin/audit-logs",         color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div className="flex flex-col gap-7">

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Row 1: Registration trend (wide) + Proposals by status (pie) */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="User Registrations — Last 6 Months">
            {hasRegistration ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={registrationTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFaculty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="students" name="Students" stroke="#16a34a" strokeWidth={2.5}
                    fill="url(#gStudents)" dot={{ r: 3, fill: "#16a34a" }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="faculty" name="Faculty" stroke="#7c3aed" strokeWidth={2.5}
                    fill="url(#gFaculty)" dot={{ r: 3, fill: "#7c3aed" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyChart height={220} />}
          </ChartCard>
        </div>

        <ChartCard title="Proposals by Status">
          {hasProposalStatus ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={proposalsByStatus.filter((p) => p.value > 0)}
                  cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {proposalsByStatus.filter((p) => p.value > 0).map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={220} />}
        </ChartCard>
      </div>

      {/* Row 2: Students per department + Faculty per department */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Students per Department">
          {hasStudentsByDept ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studentsByDept} layout="vertical"
                margin={{ top: 4, right: 20, bottom: 0, left: 8 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Students" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={220} />}
        </ChartCard>

        <ChartCard title="Faculty per Department">
          {hasFacultyByDept ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={facultyByDept} layout="vertical"
                margin={{ top: 4, right: 20, bottom: 0, left: 8 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Faculty" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={220} />}
        </ChartCard>
      </div>

      {/* Row 3: Sections by semester (bar) + Team status (donut) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Sections per Semester">
          {hasSectionsBySem ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sectionsBySemester} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="semester" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sections" name="Sections" fill="#0369a1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={200} />}
        </ChartCard>

        <ChartCard title="Team Status">
          {hasTeamStatus ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={teamsByStatus.filter((t) => t.value > 0)}
                  cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                  paddingAngle={4} dataKey="value">
                  {teamsByStatus.filter((t) => t.value > 0).map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={200} />}
        </ChartCard>
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all hover:shadow-md no-underline"
              style={{ backgroundColor: a.bg, border: `1px solid ${a.color}33`, color: a.color }}>
              {a.label}
              <IconArrowRight size={15} style={{ color: a.color, flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
