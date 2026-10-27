"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconUsers, IconFileText, IconFlag, IconUpload, IconCheck, IconChat } from "@/components/ui/Icon";
import { ChatPanel } from "@/app/(portal)/student/teams/[teamId]/chat/ChatPanel";

// ── Types 
interface TeamInfo {
  id: string; name: string; status: string;
  section: string; dept: string; dept_code: string;
  rule_label: string; team_size: number;
}
interface Member { student_id: string; is_lead: boolean; full_name: string; email: string; usn: string; cgpa: number }
interface Props {
  team: TeamInfo;
  members: Member[];
  avgCgpa: number;
  proposals: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  submissions: Record<string, unknown>[];
  mentorshipNotes: string | null;
  assignedBy: string;
  currentUserId: string;
}

// ── Tooltip 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color ?? "#fff" }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

// ── Stat card ─
function Stat({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="rounded-xl px-5 py-4 text-center" style={{ backgroundColor: bg, border: "1px solid #e5e7eb" }}>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

// ── Main ─
export function MenteeTeamDashboard({
  team, members, avgCgpa, proposals, milestones, submissions,
  mentorshipNotes, assignedBy, currentUserId,
}: Props) {

  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");
  const teamStatus = team.status as "forming" | "confirmed" | "dissolved";

  // Proposal status counts
  const propStatus = ["pending", "approved", "rejected", "revision_requested"].map((s) => ({
    name: s === "revision_requested" ? "Revision" : s.charAt(0).toUpperCase() + s.slice(1),
    value: proposals.filter((p) => p.status === s).length,
    color: s === "approved" ? "#16a34a" : s === "pending" ? "#d97706" : s === "rejected" ? "#dc2626" : "#7c3aed",
  }));

  // Milestone status
  const mileStatus = ["open", "completed", "missed"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: milestones.filter((m) => m.status === s).length,
    color: s === "completed" ? "#16a34a" : s === "open" ? "#1e3a5f" : "#dc2626",
  }));

  // Submission timeline - group by month
  const now = new Date();
  const subTrend = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 3 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      month: d.toLocaleDateString("en", { month: "short" }),
      submissions: submissions.filter((s) => String(s.submitted_at ?? "").startsWith(key)).length,
    };
  });

  // CGPA bars
  const cgpaData = members.map((m) => ({ name: m.usn || m.full_name, cgpa: m.cgpa }));

  const approvedProposal = proposals.find((p) => p.status === "approved");

  return (
    <div className="flex flex-col gap-7">

      {/* ── Tab bar ── */}
      <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: "#f3f4f6" }}>
        {([
          { id: "dashboard" as const, label: "Dashboard" },
          { id: "chat" as const, label: "Group Chat", icon: <IconChat size={13} /> },
        ]).map((t) => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === t.id ? "#ffffff" : "transparent",
              color: activeTab === t.id ? "#1e3a5f" : "#6b7280",
              boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Chat tab ── */}
      {activeTab === "chat" && (
        <ChatPanel teamId={team.id} currentUserId={currentUserId} />
      )}

      {/* ── Dashboard tab ── */}
      {activeTab === "dashboard" && (
        <>
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant={teamStatus}>{teamStatus}</Badge>
                  {team.rule_label && (
                    <span className="text-xs text-neutral-500">Rule: {team.rule_label}</span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  {team.dept} ({team.dept_code}) · Section {team.section}
                </p>
                <p className="mt-1 text-xs text-neutral-400">Assigned by {assignedBy}</p>
              </div>
              {mentorshipNotes && (
                <div className="rounded-lg px-4 py-2 text-sm max-w-xs"
                  style={{ backgroundColor: "#fff", border: "1px solid #ddd6fe", color: "#7c3aed" }}>
                  <p className="text-xs font-semibold mb-1 text-neutral-400">Mentor Notes</p>
                  {mentorshipNotes}
                </div>
              )}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            <Stat label="Members" value={members.length} color="#16a34a" bg="#f0fdf4" />
            <Stat label="Proposals" value={proposals.length} color="#1e3a5f" bg="#eff6ff" />
            <Stat label="Milestones" value={milestones.length} color="#7c3aed" bg="#f5f3ff" />
            <Stat label="Submissions" value={submissions.length} color="#0369a1" bg="#f0f9ff" />
            <Stat label="Avg CGPA" value={avgCgpa > 0 ? avgCgpa.toFixed(2) : "-"} color="#d97706" bg="#fffbeb" />
          </div>

          {/* ── Charts row 1 ── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Submission trend */}
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <p className="mb-4 text-sm font-semibold text-neutral-700">Submission Activity - Last 4 Months</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={subTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#7c3aed" strokeWidth={2.5}
                    fill="url(#gradSub)" dot={{ r: 3, fill: "#7c3aed" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Proposal status pie */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <p className="mb-3 text-sm font-semibold text-neutral-700">Proposals</p>
              {proposals.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center text-sm text-neutral-400">No proposals yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={propStatus.filter((p) => p.value > 0)} cx="50%" cy="45%"
                      innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {propStatus.filter((p) => p.value > 0).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {propStatus.map((p) => (
                  <span key={p.name} className="flex items-center gap-1 text-xs">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}: {p.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Charts row 2 ── */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* CGPA per member */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <p className="mb-4 text-sm font-semibold text-neutral-700">Member CGPA</p>
              {cgpaData.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center text-sm text-neutral-400">No members</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={cgpaData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="cgpa" name="CGPA" radius={[6, 6, 0, 0]}>
                      {cgpaData.map((d, i) => (
                        <Cell key={i} fill={d.cgpa >= 8 ? "#16a34a" : d.cgpa >= 6 ? "#d97706" : "#dc2626"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Milestone status */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <p className="mb-3 text-sm font-semibold text-neutral-700">Milestone Status</p>
              {milestones.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center text-sm text-neutral-400">No milestones yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={mileStatus.filter((m) => m.value > 0)} cx="50%" cy="45%"
                        outerRadius={65} paddingAngle={3} dataKey="value">
                        {mileStatus.filter((m) => m.value > 0).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {mileStatus.map((m) => (
                      <span key={m.name} className="flex items-center gap-1 text-xs">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                        {m.name}: {m.value}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Members ── */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ backgroundColor: "#f0fdf4", borderBottom: "1px solid #e5e7eb" }}>
              <IconUsers size={16} style={{ color: "#16a34a" }} />
              <p className="font-semibold text-neutral-800">Team Members ({members.length})</p>
            </div>
            {members.length === 0 ? (
              <div className="px-5 py-6 text-sm text-neutral-400">No members yet.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {members.map((m) => (
                  <div key={m.student_id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: "#16a34a" }}>
                        {m.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                          {m.full_name}
                          {m.is_lead && (
                            <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
                              style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>Lead</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500">{m.usn} · {m.email}</p>
                      </div>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: m.cgpa >= 8 ? "#f0fdf4" : m.cgpa >= 6 ? "#fffbeb" : "#fef2f2",
                        color: m.cgpa >= 8 ? "#16a34a" : m.cgpa >= 6 ? "#d97706" : "#dc2626"
                      }}>
                      CGPA {m.cgpa.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Milestones timeline ── */}
          {milestones.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ backgroundColor: "#f5f3ff", borderBottom: "1px solid #e5e7eb" }}>
                <IconFlag size={16} style={{ color: "#7c3aed" }} />
                <p className="font-semibold text-neutral-800">Milestones</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {milestones.map((m) => {
                  const status = String(m.status);
                  const deadline = new Date(String(m.deadline));
                  const overdue = status === "open" && deadline < new Date();
                  return (
                    <div key={String(m.id)} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ backgroundColor: status === "completed" ? "#f0fdf4" : overdue ? "#fef2f2" : "#f5f3ff" }}>
                          {status === "completed"
                            ? <IconCheck size={12} style={{ color: "#16a34a" }} />
                            : <IconFlag size={12} style={{ color: overdue ? "#dc2626" : "#7c3aed" }} />}
                        </div>
                        <p className="text-sm font-medium text-neutral-800">{String(m.name)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400">
                          {deadline.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        <Badge variant={status === "completed" ? "approved" : status === "missed" ? "rejected" : "pending"}>
                          {overdue && status === "open" ? "Overdue" : status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Proposals ── */}
          {proposals.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ backgroundColor: "#eff6ff", borderBottom: "1px solid #e5e7eb" }}>
                <IconFileText size={16} style={{ color: "#1e3a5f" }} />
                <p className="font-semibold text-neutral-800">Proposals</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {proposals.map((p) => {
                  const status = String(p.status) as "pending" | "approved" | "rejected" | "revision_requested";
                  const sv: Record<string, "pending" | "approved" | "rejected" | "revision"> = {
                    pending: "pending", approved: "approved", rejected: "rejected", revision_requested: "revision",
                  };
                  return (
                    <div key={String(p.id)} className="flex items-start justify-between gap-3 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-800">{String(p.title)}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          v{String(p.version)} · {new Date(String(p.submitted_at)).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={sv[status]}>{status.replace("_", " ")}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Recent submissions ── */}
          {submissions.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ backgroundColor: "#f0f9ff", borderBottom: "1px solid #e5e7eb" }}>
                <IconUpload size={16} style={{ color: "#0369a1" }} />
                <p className="font-semibold text-neutral-800">Recent Submissions</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {submissions.slice(0, 8).map((s) => {
                  const st = String(s.status);
                  return (
                    <div key={String(s.id)} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium capitalize text-neutral-800">{String(s.artefact_type).replace("_", " ")}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(String(s.submitted_at)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <Badge variant={st === "accepted" ? "approved" : st === "missed_deadline" ? "rejected" : "pending"}>
                        {st.replace("_", " ")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
