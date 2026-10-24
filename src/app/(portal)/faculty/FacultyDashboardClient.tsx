"use client";

import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  IconUsers, IconFileText, IconFlag, IconUpload,
  IconClipboard, IconArrowRight,
} from "@/components/ui/Icon";

// ── Types ─────────────────────────────────────────────────────
interface Props {
  stats: {
    sections: number; students: number; pendingProposals: number;
    teams: number; openMilestones: number; openWindows: number;
  };
  proposalsByStatus: { name: string; value: number; color: string }[];
  proposalTrend:     { month: string; submitted: number; approved: number }[];
  milestoneStatus:   { name: string; value: number; color: string }[];
  teamStatus:        { name: string; value: number; color: string }[];
  cgpaBands:         { range: string; count: number; color: string }[];
  studentsPerSection:{ section: string; students: number }[];
  upcomingMilestones:{ deadline: string }[];
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, bg, border, href,
}: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; border: string; href: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-4 rounded-2xl px-5 py-5 transition-all hover:shadow-md cursor-pointer no-underline"
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

// ── Chart card wrapper ────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <p className="mb-4 text-sm font-semibold text-neutral-700">{title}</p>
      {children}
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 shadow-lg text-xs"
      style={{ backgroundColor: "#1e3a5f", color: "#fff", border: "none" }}>
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color ?? "#fff" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function FacultyDashboardClient({
  stats, proposalsByStatus, proposalTrend, milestoneStatus,
  teamStatus, cgpaBands, studentsPerSection, upcomingMilestones,
}: Props) {

  const statCards = [
    { label: "Sections",         value: stats.sections,         icon: <IconClipboard size={22} />, color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe", href: "/faculty/sections" },
    { label: "Students",         value: stats.students,         icon: <IconUsers size={22} />,     color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", href: "/faculty/sections" },
    { label: "Pending Proposals",value: stats.pendingProposals, icon: <IconFileText size={22} />,  color: "#d97706", bg: "#fffbeb", border: "#fde68a", href: "/faculty/proposals" },
    { label: "Teams",            value: stats.teams,            icon: <IconUsers size={22} />,     color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", href: "/faculty/sections" },
    { label: "Open Milestones",  value: stats.openMilestones,   icon: <IconFlag size={22} />,      color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", href: "/faculty/milestones" },
    { label: "Open Windows",     value: stats.openWindows,      icon: <IconUpload size={22} />,    color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff", href: "/faculty/submission-windows" },
  ];

  const daysUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400_000));
  };

  return (
    <div className="flex flex-col gap-7">

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Row 1: Proposal trend (wide) + Proposal status pie ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Proposal Activity — Last 6 Months">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={proposalTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradSubmit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApprove" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#gradSubmit)" dot={{ r: 3, fill: "#1e3a5f" }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="approved"  name="Approved"  stroke="#16a34a" strokeWidth={2.5} fill="url(#gradApprove)" dot={{ r: 3, fill: "#16a34a" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Proposals by Status">
          {proposalsByStatus.every((p) => p.value === 0) ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-neutral-400">No proposals yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={proposalsByStatus.filter((p) => p.value > 0)} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {proposalsByStatus.filter((p) => p.value > 0).map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: CGPA distribution (bar) + Students per section (bar) ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Student CGPA Distribution">
          {cgpaBands.every((b) => b.count === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-neutral-400">No student data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cgpaBands} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                  {cgpaBands.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Students per Section">
          {studentsPerSection.every((s) => s.students === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-neutral-400">No sections</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={studentsPerSection} layout="vertical"
                margin={{ top: 4, right: 20, bottom: 0, left: 8 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="section" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="students" name="Students" fill="#1e3a5f" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Milestones + Teams + Upcoming deadlines ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <ChartCard title="Milestone Status">
          {milestoneStatus.every((m) => m.value === 0) ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-neutral-400">No milestones</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={milestoneStatus.filter((m) => m.value > 0)} cx="50%" cy="45%" outerRadius={70}
                  paddingAngle={3} dataKey="value" labelLine={false}>
                  {milestoneStatus.filter((m) => m.value > 0).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Team Status">
          {teamStatus.every((t) => t.value === 0) ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-neutral-400">No teams yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={teamStatus} cx="50%" cy="45%" innerRadius={40} outerRadius={70}
                  paddingAngle={4} dataKey="value">
                  {teamStatus.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Upcoming milestone deadlines */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
          <p className="mb-4 text-sm font-semibold text-neutral-700">Upcoming Deadlines (30 days)</p>
          {upcomingMilestones.length === 0 ? (
            <div className="flex h-[140px] items-center justify-center text-sm text-neutral-400">
              No upcoming deadlines
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingMilestones.map((m, i) => {
                const days = daysUntil(m.deadline);
                const urgent = days <= 3;
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ backgroundColor: urgent ? "#fef2f2" : "#f9fafb", border: `1px solid ${urgent ? "#fecaca" : "#e5e7eb"}` }}>
                    <span className="text-xs text-neutral-600">
                      {new Date(m.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: urgent ? "#dc2626" : "#1e3a5f", color: "#fff" }}>
                      {days === 0 ? "Today" : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Review Proposals",    href: "/faculty/proposals",          color: "#d97706", bg: "#fffbeb" },
            { label: "My Sections",          href: "/faculty/sections",           color: "#1e3a5f", bg: "#eff6ff" },
            { label: "Create Milestone",     href: "/faculty/milestones",         color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Open Submission Window", href: "/faculty/submission-windows", color: "#9333ea", bg: "#fdf4ff" },
          ].map((a) => (
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
