"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  IconUsers, IconFileText, IconFlag, IconUpload,
  IconSettings, IconArrowRight, IconCheck,
} from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

interface Props {
  fullName: string;
  usn: string;
  cgpa: number;
  teamName: string | null;
  teamStatus: string | null;
  isLead: boolean;
  proposalCount: number;
  approvedProposals: number;
  pendingProposals: number;
  totalMilestones: number;
  completedMilestones: number;
  openMilestones: number;
  missedMilestones: number;
  totalSubmissions: number;
  upcomingDeadlines: { name: string; deadline: string; status: string }[];
}

function ChartTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>
      {payload[0].name}: <strong>{payload[0].value}</strong>
    </div>
  );
}

function DonutCard({
  title, data, center, href,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
  center: React.ReactNode;
  href: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const filled = data.filter((d) => d.value > 0);

  return (
    <Link href={href}
      className="flex flex-col rounded-2xl p-5 no-underline transition-all hover:shadow-md"
      style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
      <p className="mb-3 text-sm font-semibold text-neutral-700">{title}</p>
      {total === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-sm text-neutral-300">
          Nothing yet
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={filled} cx="50%" cy="50%"
                  innerRadius={38} outerRadius={56}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {filled.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {center}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {filled.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} <strong className="text-neutral-700">{d.value}</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </Link>
  );
}

export function StudentDashboardClient({
  fullName, usn, cgpa, teamName, teamStatus, isLead,
  proposalCount, approvedProposals, pendingProposals,
  totalMilestones, completedMilestones, openMilestones, missedMilestones,
  totalSubmissions, upcomingDeadlines,
}: Props) {
  const firstName = fullName.split(" ")[0];

  const daysUntil = (iso: string) =>
    Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

  const progressSteps = [
    { label: "Joined a team",       done: !!teamName,              sub: teamName ? `${teamName} · ${teamStatus}` : "Find or form a team",        href: "/student/teams" },
    { label: "Team confirmed",       done: teamStatus === "confirmed", sub: teamStatus === "confirmed" ? "Locked and active" : "Waiting for faculty", href: "/student/teams" },
    { label: "Proposal submitted",   done: proposalCount > 0,       sub: proposalCount > 0 ? `${proposalCount} proposal${proposalCount > 1 ? "s" : ""}` : "Submit to faculty",   href: "/student/proposals" },
    { label: "Proposal approved",    done: approvedProposals > 0,   sub: approvedProposals > 0 ? "Approved by faculty" : "Awaiting review",        href: "/student/proposals" },
    { label: "Deliverables uploaded",done: totalSubmissions > 0,    sub: totalSubmissions > 0 ? `${totalSubmissions} upload${totalSubmissions > 1 ? "s" : ""}` : "No uploads yet", href: "/student/submissions" },
  ];
  const doneCount = progressSteps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / progressSteps.length) * 100);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6"
        style={{ backgroundColor: "#1e3a5f" }}>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-10"
          style={{ backgroundColor: "#fff" }} />
        <div className="pointer-events-none absolute -right-4 -bottom-14 h-36 w-36 rounded-full opacity-10"
          style={{ backgroundColor: "#fff" }} />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xl font-bold text-white">Hello, {firstName} 👋</p>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{usn}</p>
          </div>

          {/* Team pill */}
          {teamName ? (
            <Link href="/student/teams"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3 no-underline transition-all hover:opacity-90"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {teamName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{teamName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={teamStatus === "confirmed" ? "confirmed" : teamStatus === "forming" ? "forming" : "neutral"}>
                    {teamStatus}
                  </Badge>
                  {isLead && <Badge variant="neutral">Lead</Badge>}
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/student/teams"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white no-underline transition-all hover:opacity-90"
              style={{ backgroundColor: "#16a34a" }}>
              Find a Team →
            </Link>
          )}
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CGPA",        value: cgpa.toFixed(2), icon: <IconFlag size={20} />,     color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe", href: null },
          { label: "Proposals",   value: proposalCount,   icon: <IconFileText size={20} />, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", href: "/student/proposals" },
          { label: "Milestones",  value: totalMilestones, icon: <IconFlag size={20} />,     color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", href: "/student/milestones" },
          { label: "Submissions", value: totalSubmissions,icon: <IconUpload size={20} />,   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", href: "/student/submissions" },
        ].map((c) => {
          const inner = (
            <>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}18`, color: c.color }}>
                {c.icon}
              </div>
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: c.color }}>{c.value}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{c.label}</p>
              </div>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}
              className="flex items-center gap-4 rounded-2xl px-5 py-4 no-underline transition-all hover:shadow-md"
              style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}
              className="flex items-center gap-4 rounded-2xl px-5 py-4"
              style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* ── Donuts row ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DonutCard
          title="Proposals"
          href="/student/proposals"
          data={[
            { name: "Approved", value: approvedProposals,                                                           color: "#16a34a" },
            { name: "Pending",  value: pendingProposals,                                                            color: "#d97706" },
            { name: "Other",    value: Math.max(0, proposalCount - approvedProposals - pendingProposals),           color: "#e5e7eb" },
          ]}
          center={
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: "#1e3a5f" }}>{proposalCount}</p>
              <p className="text-xs text-neutral-400">total</p>
            </div>
          }
        />

        <DonutCard
          title="Milestones"
          href="/student/milestones"
          data={[
            { name: "Completed", value: completedMilestones, color: "#16a34a" },
            { name: "Open",      value: openMilestones,      color: "#1e3a5f" },
            { name: "Missed",    value: missedMilestones,    color: "#dc2626" },
          ]}
          center={
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: "#1e3a5f" }}>{totalMilestones}</p>
              <p className="text-xs text-neutral-400">total</p>
            </div>
          }
        />
      </div>

      {/* ── Bottom row: Deadlines + Progress ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Upcoming deadlines */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
          <p className="mb-4 text-sm font-semibold text-neutral-700">Upcoming Deadlines</p>
          {upcomingDeadlines.length === 0 ? (
            <div className="flex h-28 items-center justify-center text-sm text-neutral-300">
              No upcoming deadlines
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingDeadlines.map((m, i) => {
                const days = daysUntil(m.deadline);
                const urgent = days <= 2;
                return (
                  <div key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: urgent ? "#fef2f2" : "#f9fafb",
                      border: `1px solid ${urgent ? "#fecaca" : "#f3f4f6"}`,
                    }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: urgent ? "#dc2626" : days <= 7 ? "#d97706" : "#1e3a5f" }}>
                      {days === 0 ? "!" : days}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-800">{m.name}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(m.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-semibold"
                      style={{ color: urgent ? "#dc2626" : days <= 7 ? "#d97706" : "#6b7280" }}>
                      {days === 0 ? "Today" : `${days}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress checklist */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-700">Your Progress</p>
            <span className="text-sm font-bold" style={{ color: "#1e3a5f" }}>{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "#e5e7eb" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "#16a34a" : "#1e3a5f" }} />
          </div>

          <div className="flex flex-col gap-2">
            {progressSteps.map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition-all hover:shadow-sm"
                style={{
                  backgroundColor: item.done ? "#f0fdf4" : "#fafafa",
                  border: `1px solid ${item.done ? "#bbf7d0" : "#f3f4f6"}`,
                }}>
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.done ? "#16a34a" : "#e5e7eb" }}>
                  {item.done
                    ? <IconCheck size={10} style={{ color: "#fff" }} />
                    : <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#9ca3af" }} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate"
                    style={{ color: item.done ? "#15803d" : "#374151" }}>
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{item.sub}</p>
                </div>
                <IconArrowRight size={12} style={{ color: "#d1d5db", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "My Team",    href: "/student/teams",       icon: <IconUsers size={16} />,    color: "#1e3a5f", bg: "#eff6ff" },
            { label: "Proposals",  href: "/student/proposals",   icon: <IconFileText size={16} />, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Milestones", href: "/student/milestones",  icon: <IconFlag size={16} />,     color: "#0369a1", bg: "#f0f9ff" },
            { label: "Submissions",href: "/student/submissions", icon: <IconUpload size={16} />,   color: "#16a34a", bg: "#f0fdf4" },
            { label: "Profile",    href: "/student/profile",     icon: <IconSettings size={16} />, color: "#d97706", bg: "#fffbeb" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-xs font-semibold no-underline transition-all hover:shadow-md"
              style={{ backgroundColor: a.bg, border: `1px solid ${a.color}22`, color: a.color }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${a.color}18` }}>
                {a.icon}
              </span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
