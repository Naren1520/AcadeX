"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/forms/FormError";
import { checkEligibility, findMatchingSlot } from "@/server/workflows/teamFormationEngine";
import type { TeamFormationRule, SlotDefinition } from "@/server/workflows/teamFormationEngine";
import { IconUsers, IconCheck, IconAlertCircle } from "@/components/ui/Icon";

// ── Types ─────────────────────────────────────────────────────
interface Invitation {
  id: string;
  team_id: string;
  created_at: string;
  teams: { id: string; name: string; status: string } | null;
  profiles: { full_name: string; email: string } | null;
}

interface Sectionmate {
  id: string;
  usn: string;
  cgpa: number;
  full_name: string;
  email: string;
}

interface TeamMember {
  student_id: string;
  is_lead: boolean;
  full_name: string;
  email: string;
  usn: string;
  cgpa: number;
}

interface SentInvitation {
  id: string;
  invitee_id: string;
  status: string;
  full_name: string;
  email: string;
}

interface Props {
  studentId: string;
  studentCgpa: number;
  sectionId: string | null;
  currentMembership: Record<string, unknown> | null;
  sectionTeams: Record<string, unknown>[];
  rules: Record<string, unknown>[];
  pendingInvitations: Invitation[];
  sectionmates: Sectionmate[];
  teamMembers: TeamMember[];
  sentInvitations: SentInvitation[];
}

// ── Pending invitations inbox ─────────────────────────────────
function InvitationsInbox({ invitations }: { invitations: Invitation[] }) {
  const [list, setList] = useState(invitations);
  const [loading, setLoading] = useState<{ id: string; action: "accept" | "decline" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (list.length === 0) return null;

  async function respond(inv: Invitation, action: "accept" | "decline") {
    setLoading({ id: inv.id, action }); setError(null);
    const res = await fetch(`/api/teams/${inv.team_id}/invitations/${inv.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setError(data.error ?? "Failed."); setLoading(null); return; }
    if (action === "accept") { window.location.reload(); return; }
    setList((p) => p.filter((i) => i.id !== inv.id));
    setLoading(null);
  }

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-base font-semibold text-neutral-900">
        Team Invitations ({list.length})
      </h2>
      <FormError message={error} />
      <div className="flex flex-col gap-3">
        {list.map((inv) => (
          <div key={inv.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ border: "1px solid #bfdbfe", backgroundColor: "#eff6ff" }}>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Invited to join <strong>{inv.teams?.name ?? "a team"}</strong>
              </p>
              <p className="text-xs text-neutral-500">
                From: {inv.profiles?.full_name ?? "Team Lead"} · {new Date(inv.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm"
                isLoading={loading?.id === inv.id && loading?.action === "decline"}
                disabled={loading?.id === inv.id}
                onClick={() => respond(inv, "decline")}>
                Decline
              </Button>
              <Button variant="primary" size="sm"
                isLoading={loading?.id === inv.id && loading?.action === "accept"}
                disabled={loading?.id === inv.id}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => respond(inv, "accept")}>
                <IconCheck size={13} /> Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── My Team Card ──────────────────────────────────────────────
function MyTeamCard({
  membership, studentId, sectionmates, teamId,
  initialMembers, initialSentInvitations,
}: {
  membership: Record<string, unknown>;
  studentId: string;
  sectionmates: Sectionmate[];
  teamId: string;
  initialMembers: TeamMember[];
  initialSentInvitations: SentInvitation[];
}) {
  const team = membership.teams as Record<string, unknown>;
  const isLead = !!membership.is_lead;
  const status = String(team.status ?? "forming") as "forming" | "confirmed" | "dissolved";

  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(initialSentInvitations);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteeId, setInviteeId] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const memberIds = new Set(members.map((m) => m.student_id));
  const invitedIds = new Set(pending.map((i) => i.invitee_id));
  const available = sectionmates.filter(
    (s) => s.id !== studentId && !memberIds.has(s.id) && !invitedIds.has(s.id)
  );

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteeId) return;
    setInviteLoading(true); setInviteError(null);
    const res = await fetch(`/api/teams/${teamId}/invitations`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitee_id: inviteeId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setInviteError(data.error ?? "Failed."); setInviteLoading(false); return; }
    const s = sectionmates.find((x) => x.id === inviteeId)!;
    setPending((p) => [...p, { id: Date.now().toString(), invitee_id: s.id, status: "pending", full_name: s.full_name, email: s.email }]);
    setShowInvite(false); setInviteeId(""); setInviteLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{String(team.name)}</CardTitle>
          <Badge variant={status}>{status}</Badge>
          {isLead && <Badge variant="neutral">Team Lead</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {status === "confirmed" && (
          <p className="mb-4 text-sm font-medium" style={{ color: "#16a34a" }}>
            Team is confirmed - you can submit proposals.
          </p>
        )}

        {/* Members */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Members ({members.length})
          </p>
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <div key={m.student_id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#16a34a" }}>
                  {m.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-800">
                    {m.full_name}
                    {m.is_lead && (
                      <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: "#1e3a5f", color: "#fff" }}>Lead</span>
                    )}
                    {m.student_id === studentId && (
                      <span className="text-xs text-neutral-400">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500">{m.usn} · CGPA {m.cgpa.toFixed(2)}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}>
                  <IconCheck size={12} /> Joined
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending sent invitations */}
        {pending.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Invited - Awaiting Response ({pending.length})
            </p>
            <div className="flex flex-col gap-2">
              {pending.map((inv) => (
                <div key={inv.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#fde68a", color: "#92400e" }}>
                    {inv.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{inv.full_name}</p>
                    <p className="text-xs text-neutral-500">{inv.email}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#d97706" }}>
                    Pending…
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite button */}
        {status === "forming" && isLead && (
          <div>
            <Button variant="primary" size="sm"
              onClick={() => { setInviteeId(""); setInviteError(null); setShowInvite(true); }}
              disabled={available.length === 0}>
              <IconUsers size={13} /> Invite a Student
            </Button>
            {available.length === 0 && (
              <p className="mt-2 text-xs text-neutral-400">
                All eligible section mates have been invited or joined.
              </p>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={showInvite} onOpenChange={setShowInvite}
        title="Invite Student to Your Team"
        description="Select a section mate - only students who fit the team rule are shown.">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <FormError message={inviteError} />
          <Select
            label="Student"
            value={inviteeId}
            onValueChange={setInviteeId}
            options={available.map((s) => ({
              value: s.id,
              label: `${s.full_name} (${s.usn}) - CGPA ${s.cgpa.toFixed(2)}`,
            }))}
            placeholder="Select student…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={inviteLoading} disabled={!inviteeId}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────
export function TeamsClient({
  studentId, studentCgpa, sectionId,
  currentMembership, sectionTeams, rules,
  pendingInvitations, sectionmates,
  teamMembers, sentInvitations,
}: Props) {
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedRule, setSelectedRule] = useState("");
  const [isForming, setIsForming] = useState(false);

  const team = currentMembership ? (currentMembership.teams as Record<string, unknown>) : null;
  const teamId = team ? String(team.id) : "";

  async function handleJoin(tid: string) {
    if (!sectionId) return;
    setJoiningTeam(tid); setJoinError(null);
    const res = await fetch(`/api/teams/${tid}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) setJoinError(data.error ?? "Failed to join team.");
    else window.location.reload();
    setJoiningTeam(null);
  }

  async function handleFormTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionId || !selectedRule) return;
    setIsForming(true); setFormError(null);
    const res = await fetch("/api/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId, rule_id: selectedRule, team_name: newTeamName }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setFormError(data.error ?? "Failed."); setIsForming(false); return; }
    window.location.reload();
  }

  // ── Already in a team ─────────────────────────────────────
  if (team) {
    return (
      <div className="flex flex-col gap-6">
        <InvitationsInbox invitations={pendingInvitations} />
        <MyTeamCard
          membership={currentMembership!}
          studentId={studentId}
          sectionmates={sectionmates}
          teamId={teamId}
          initialMembers={teamMembers}
          initialSentInvitations={sentInvitations}
        />
      </div>
    );
  }

  // ── Not in a team ─────────────────────────────────────────
  const typedRules = rules as unknown as TeamFormationRule[];

  return (
    <div className="flex flex-col gap-6">
      <InvitationsInbox invitations={pendingInvitations} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Join existing */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-neutral-900">
            Available Teams ({sectionTeams.length})
          </h2>
          <FormError message={joinError} />
          {sectionTeams.length === 0 ? (
            <div className="rounded-xl p-8 text-center text-sm text-neutral-500"
              style={{ border: "2px dashed #e5e7eb" }}>
              No teams accepting members right now.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sectionTeams.map((t) => {
                const rule = t.team_formation_rules as TeamFormationRule | undefined;
                const slots: SlotDefinition[] = rule?.team_formation_slots ?? [];
                const eligible = slots.length > 0
                  ? findMatchingSlot(studentCgpa, slots) !== null
                  : rule ? checkEligibility(studentCgpa, [rule]).eligible : false;

                return (
                  <div key={String(t.id)} className="rounded-xl p-4"
                    style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{String(t.name)}</p>
                        {rule?.label && <p className="text-xs text-neutral-500">Rule: {rule.label}</p>}
                        {slots.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {slots.map((s, i) => (
                              <span key={i} className="rounded px-2 py-0.5 text-xs"
                                style={{ backgroundColor: "#f0f9ff", color: "#0369a1" }}>
                                {s.count}× CGPA {s.cgpa_lower}–{s.cgpa_upper}
                                {s.label ? ` (${s.label})` : ""}
                              </span>
                            ))}
                          </div>
                        ) : rule && (
                          <p className="text-xs text-neutral-500">CGPA {rule.cgpa_lower}–{rule.cgpa_upper}</p>
                        )}
                        {!eligible && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                            <IconAlertCircle size={11} /> Your CGPA ({studentCgpa}) doesn&apos;t fit.
                          </p>
                        )}
                      </div>
                      <Button variant="primary" size="sm" disabled={!eligible}
                        isLoading={joiningTeam === String(t.id)}
                        onClick={() => handleJoin(String(t.id))}>
                        Join
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form new */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-neutral-900">Form a New Team</h2>
          <Card>
            <CardContent>
              <form onSubmit={handleFormTeam} className="flex flex-col gap-4">
                <FormError message={formError} />
                <Input label="Team Name" value={newTeamName} required placeholder="Team Alpha" maxLength={100}
                  onChange={(e) => setNewTeamName(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">Formation Rule</label>
                  <select value={selectedRule} onChange={(e) => setSelectedRule(e.target.value)} required
                    className="cursor-pointer rounded px-3 py-2 text-sm focus:outline-none"
                    style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }}>
                    <option value="">Select a rule…</option>
                    {typedRules.map((rule) => {
                      const slots = rule.team_formation_slots ?? [];
                      const eligible = slots.length > 0
                        ? findMatchingSlot(studentCgpa, slots) !== null
                        : checkEligibility(studentCgpa, [rule]).eligible;
                      const quota = (rule.formed_count ?? 0) >= rule.max_teams;
                      return (
                        <option key={rule.id} value={rule.id} disabled={!eligible || quota}>
                          {rule.label ?? "Rule"} - size {rule.team_size ?? rule.max_team_size}
                          {quota ? " (quota full)" : !eligible ? " (ineligible)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {selectedRule && (() => {
                  const r = typedRules.find((x) => x.id === selectedRule);
                  const slots = r?.team_formation_slots ?? [];
                  if (!slots.length) return null;
                  return (
                    <div className="rounded-xl p-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                      <p className="mb-1 text-xs font-semibold text-neutral-400">Required composition:</p>
                      <div className="flex flex-wrap gap-1">
                        {slots.map((s, i) => (
                          <span key={i} className="rounded px-2 py-0.5 text-xs"
                            style={{ backgroundColor: "#eff6ff", color: "#1e3a5f" }}>
                            {s.count}× {s.cgpa_lower}–{s.cgpa_upper}{s.label ? ` (${s.label})` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <Button type="submit" variant="primary" isLoading={isForming}
                  disabled={!selectedRule || !newTeamName}>
                  Form Team
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
