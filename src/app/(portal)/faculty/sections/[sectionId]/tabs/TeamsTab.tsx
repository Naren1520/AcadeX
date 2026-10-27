"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconUsers, IconCheck, IconAlertCircle } from "@/components/ui/Icon";

interface SlotDef { cgpa_lower: number; cgpa_upper: number; count: number; label: string }

interface TeamMember {
  student_id: string;
  is_lead: boolean;
  full_name: string;
  email: string;
  usn: string;
  cgpa: number;
}

interface PendingInvite {
  id: string;
  invitee_id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  status: "forming" | "confirmed" | "dissolved";
  rule_id: string;
  rule_label: string;
  team_size: number;
  slots: SlotDef[];
  members: TeamMember[];
  pending_invites: PendingInvite[];
}

interface Props {
  sectionId: string;
  initialTeams: Team[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function TeamCard({ team }: { team: Team }) {
  const [expanded, setExpanded] = useState(false);
  const memberCount = team.members.length;
  const neededCount = team.team_size;
  const pendingCount = team.pending_invites.length;
  const fillPct = neededCount > 0 ? Math.min((memberCount / neededCount) * 100, 100) : 0;

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
        style={{ backgroundColor: "#f9fafb", borderBottom: expanded ? "1px solid #e5e7eb" : undefined }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-neutral-900">{team.name}</span>
          <Badge variant={team.status}>{team.status}</Badge>
          <span className="text-xs text-neutral-500">
            Rule: <strong>{team.rule_label || "-"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Fill progress */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full" style={{ backgroundColor: "#e5e7eb" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${fillPct}%`, backgroundColor: fillPct >= 100 ? "#16a34a" : "#1e3a5f" }} />
            </div>
            <span className="text-xs font-medium text-neutral-600">{memberCount}/{neededCount}</span>
          </div>
          {pendingCount > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
              {pendingCount} pending
            </span>
          )}
          <span className="text-xs text-neutral-400">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {/* Rule composition */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Required Composition
            </p>
            {team.slots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {team.slots.map((s, i) => (
                  <div key={i} className="rounded-lg px-3 py-1.5 text-xs"
                    style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a5f" }}>
                    <strong>{s.count}×</strong> CGPA {Number(s.cgpa_lower)}–{Number(s.cgpa_upper)}
                    {s.label ? ` (${s.label})` : ""}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No slot data (legacy rule)</p>
            )}
          </div>

          {/* Members */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Members ({memberCount}/{neededCount})
            </p>
            {memberCount === 0 ? (
              <p className="text-xs text-neutral-400 italic">No members yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {team.members.map((m) => (
                  <div key={m.student_id} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#16a34a" }}>
                      {m.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                        {m.full_name}
                        {m.is_lead && (
                          <span className="rounded-full px-1 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>Lead</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400">{m.usn} · CGPA {m.cgpa.toFixed(2)}</p>
                    </div>
                    <IconCheck size={12} style={{ color: "#16a34a", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending invitations */}
          {pendingCount > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Pending Invitations ({pendingCount})
              </p>
              <div className="flex flex-col gap-1.5">
                {team.pending_invites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "#fde68a", color: "#92400e" }}>
                      {inv.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-800">{inv.full_name}</p>
                      <p className="text-xs text-neutral-400">{inv.email}</p>
                    </div>
                    <span className="text-xs text-neutral-400">Sent {fmtDate(inv.created_at)}</span>
                    <IconAlertCircle size={12} style={{ color: "#d97706", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TeamsTab({ sectionId, initialTeams }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [loading, setLoading] = useState(initialTeams.length === 0);

  // Lazy-load on first render if not pre-fetched
  useEffect(() => {
    if (initialTeams.length > 0) { setLoading(false); return; }
    fetch(`/api/teams?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then((d: { teams?: Team[] }) => { setTeams(d.teams ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sectionId, initialTeams.length]);

  if (loading) {
    return <div className="py-10 text-center text-sm text-neutral-400">Loading teams…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          <strong>{teams.length}</strong> team{teams.length !== 1 ? "s" : ""} in this section
        </p>
        <div className="flex gap-3 text-xs text-neutral-500">
          {(["forming", "confirmed", "dissolved"] as const).map((s) => {
            const n = teams.filter((t) => t.status === s).length;
            return n > 0 ? (
              <span key={s} className="flex items-center gap-1">
                <Badge variant={s}>{s}</Badge> {n}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-sm text-neutral-500"
          style={{ border: "2px dashed #e5e7eb" }}>
          <IconUsers size={28} style={{ color: "#9ca3af", margin: "0 auto 8px" }} />
          No teams yet. Students can form teams using the Team Rules you define.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {teams.map((t) => <TeamCard key={t.id} team={t} />)}
        </div>
      )}
    </div>
  );
}
