"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconUsers, IconFileText, IconFlag, IconClipboard, IconChat } from "@/components/ui/Icon";
import { ChatPanel } from "./chat/ChatPanel";
import type { TeamPageMember, TeamPageMentor, TeamPageProposal, TeamPageMilestone } from "./page";

type Tab = "overview" | "members" | "proposals" | "milestones" | "chat";

interface Props {
  teamId: string; teamName: string;
  teamStatus: "forming" | "confirmed" | "dissolved";
  currentUserId: string; isLead: boolean;
  members: TeamPageMember[];
  mentor: TeamPageMentor | null;
  proposals: TeamPageProposal[];
  milestones: TeamPageMilestone[];
  ruleLabel: string; teamSize: number;
  slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[];
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",   label: "Overview",   icon: <IconClipboard size={14} /> },
  { id: "members",    label: "Members",    icon: <IconUsers size={14} /> },
  { id: "proposals",  label: "Proposals",  icon: <IconFileText size={14} /> },
  { id: "milestones", label: "Milestones", icon: <IconFlag size={14} /> },
  { id: "chat",       label: "Group Chat", icon: <IconChat size={14} /> },
];

export function TeamDashboard({
  teamId, teamName, teamStatus, currentUserId, isLead,
  members, mentor, proposals, milestones, ruleLabel, teamSize, slots,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const pendingCount  = proposals.filter((p) => p.status === "pending").length;
  const openCount     = milestones.filter((m) => m.status === "open").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-xl p-1" style={{ backgroundColor: "#f3f4f6" }}>
          {TABS.map((t) => {
            const badge = t.id === "proposals" && pendingCount > 0 ? pendingCount
              : t.id === "milestones" && openCount > 0 ? openCount : null;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: tab === t.id ? "#ffffff" : "transparent",
                  color:           tab === t.id ? "#1e3a5f" : "#6b7280",
                  boxShadow:       tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                {t.icon} {t.label}
                {badge && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#dc2626" }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab teamStatus={teamStatus} ruleLabel={ruleLabel} teamSize={teamSize}
          slots={slots} memberCount={members.length} mentor={mentor}
          pendingProposals={pendingCount} openMilestones={openCount}
          proposalCount={proposals.length} onNavigate={setTab} />
      )}
      {tab === "members" && (
        <MembersTab members={members} currentUserId={currentUserId} isLead={isLead} mentor={mentor} />
      )}
      {tab === "proposals" && <ProposalsTab proposals={proposals} />}
      {tab === "milestones" && <MilestonesTab milestones={milestones} />}
      {tab === "chat" && <ChatPanel teamId={teamId} currentUserId={currentUserId} />}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────
function OverviewTab({ teamStatus, ruleLabel, teamSize, slots, memberCount, mentor, pendingProposals, openMilestones, proposalCount, onNavigate }: {
  teamStatus: string; ruleLabel: string; teamSize: number;
  slots: { cgpa_lower: number; cgpa_upper: number; count: number; label: string }[];
  memberCount: number; mentor: TeamPageMentor | null;
  pendingProposals: number; openMilestones: number; proposalCount: number; onNavigate: (t: Tab) => void;
}) {
  const status = teamStatus as "forming" | "confirmed" | "dissolved";
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl p-5" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge variant={status}>{status}</Badge>
          {ruleLabel && <span className="text-xs text-neutral-500">Rule: <strong>{ruleLabel}</strong></span>}
          {teamSize > 0 && <span className="text-xs text-neutral-500">Size: <strong>{memberCount}/{teamSize}</strong></span>}
        </div>
        {slots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slots.map((s, i) => (
              <span key={i} className="rounded px-2 py-0.5 text-xs"
                style={{ backgroundColor: "#eff6ff", color: "#1e3a5f", border: "1px solid #bfdbfe" }}>
                {s.count}× CGPA {Number(s.cgpa_lower)}–{Number(s.cgpa_upper)}
                {s.label ? ` (${s.label})` : ""}
              </span>
            ))}
          </div>
        )}
        {mentor && (
          <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe" }}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}>
              {mentor.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#7c3aed" }}>Project Mentor</p>
              <p className="text-sm font-medium text-neutral-800">{mentor.full_name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Members",   value: memberCount,       color: "#16a34a", bg: "#f0fdf4", tab: "members"    as Tab },
          { label: "Proposals",  value: proposalCount,     color: "#1e3a5f", bg: "#eff6ff", tab: "proposals"  as Tab },
          { label: "Milestones",value: openMilestones,    color: "#7c3aed", bg: "#f5f3ff", tab: "milestones" as Tab },
          { label: "Chat",      value: "→",               color: "#0369a1", bg: "#f0f9ff", tab: "chat"       as Tab },
        ].map((s) => (
          <button key={s.label} type="button" onClick={() => onNavigate(s.tab)}
            className="cursor-pointer rounded-xl px-4 py-4 text-center transition-all hover:shadow-md"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.color}22` }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────
function MembersTab({ members, currentUserId, isLead, mentor }: {
  members: TeamPageMember[]; currentUserId: string; isLead: boolean; mentor: TeamPageMentor | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
        <div className="px-5 py-3" style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <p className="text-sm font-semibold text-neutral-700">Team Members ({members.length})</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {members.map((m) => (
            <div key={m.student_id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "#16a34a" }}>
                {m.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-800">
                  {m.full_name}
                  {m.is_lead && <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>Lead</span>}
                  {m.student_id === currentUserId && <span className="text-xs text-neutral-400">(you)</span>}
                </p>
                <p className="text-xs text-neutral-500">{m.usn} · CGPA {m.cgpa.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mentor && (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #ddd6fe" }}>
          <div className="px-5 py-3" style={{ backgroundColor: "#f5f3ff", borderBottom: "1px solid #ddd6fe" }}>
            <p className="text-sm font-semibold" style={{ color: "#7c3aed" }}>Project Mentor</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "#7c3aed" }}>
              {mentor.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">{mentor.full_name}</p>
              <p className="text-xs text-neutral-500">{mentor.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Proposals ─────────────────────────────────────────────────
function ProposalsTab({ proposals }: { proposals: TeamPageProposal[] }) {
  const sv: Record<string, "pending" | "approved" | "rejected" | "revision"> = {
    pending: "pending", approved: "approved", rejected: "rejected", revision_requested: "revision",
  };
  return (
    <div className="flex flex-col gap-3">
      {proposals.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500" style={{ border: "2px dashed #e5e7eb" }}>
          No proposals submitted yet.
        </div>
      ) : proposals.map((p) => (
        <div key={p.id} className="rounded-xl p-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900">{p.title}</p>
              <p className="text-xs text-neutral-400">v{p.version} · {new Date(p.submitted_at).toLocaleDateString()}</p>
            </div>
            <Badge variant={sv[p.status] ?? "neutral"}>{p.status.replace("_", " ")}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Milestones ────────────────────────────────────────────────
function MilestonesTab({ milestones }: { milestones: TeamPageMilestone[] }) {
  return (
    <div className="flex flex-col gap-3">
      {milestones.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500" style={{ border: "2px dashed #e5e7eb" }}>
          No milestones yet.
        </div>
      ) : milestones.map((m) => {
        const overdue = m.status === "open" && new Date(m.deadline) < new Date();
        return (
          <div key={m.id} className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
            <p className="text-sm font-medium text-neutral-800">{m.name}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">
                {new Date(m.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </span>
              <Badge variant={m.status === "completed" ? "approved" : m.status === "missed" ? "rejected" : "pending"}>
                {overdue && m.status === "open" ? "Overdue" : m.status}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
