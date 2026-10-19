"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { checkEligibility } from "@/server/workflows/teamFormationEngine";
import type { TeamFormationRule } from "@/server/workflows/teamFormationEngine";

interface Props {
  studentId: string;
  studentCgpa: number;
  sectionId: string | null;
  currentMembership: Record<string, unknown> | null;
  sectionTeams: Record<string, unknown>[];
  rules: Record<string, unknown>[];
}

export function TeamsClient({ studentId, studentCgpa, sectionId, currentMembership, sectionTeams, rules }: Props) {
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [isForming, setIsForming] = useState(false);

  const team = currentMembership
    ? (currentMembership.teams as Record<string, unknown>)
    : null;

  async function handleJoin(teamId: string) {
    if (!sectionId) return;
    setJoiningTeam(teamId); setJoinError(null);
    const res = await fetch(`/api/teams/${teamId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setJoinError(data.error ?? "Failed to join team."); }
    else { window.location.reload(); }
    setJoiningTeam(null);
  }

  async function handleFormTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionId || !selectedRule) return;
    setIsForming(true); setFormError(null);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_id: sectionId, rule_id: selectedRule, team_name: newTeamName }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setFormError(data.error ?? "Failed to form team."); setIsForming(false); return; }
    window.location.reload();
  }

  if (team) {
    const teamStatus = String(team.status ?? "forming") as "forming" | "confirmed" | "dissolved";
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>{String(team.name)}</CardTitle>
            <Badge variant={teamStatus}>{teamStatus}</Badge>
            {!!currentMembership?.is_lead && <Badge variant="neutral">Team Lead</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600">You are already a member of this team.</p>
          {teamStatus === "confirmed" && (
            <p className="mt-2 text-sm text-green-700">
              Your team is confirmed and ready to submit proposals.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Join existing team */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">
          Available Teams ({sectionTeams.length})
        </h2>
        <FormError message={joinError} />
        {sectionTeams.length === 0 ? (
          <p className="text-sm text-neutral-500">No teams are currently accepting members.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sectionTeams.map((t) => {
              const rule = t.team_formation_rules as TeamFormationRule | undefined;
              const eligibility = rule ? checkEligibility(studentCgpa, [rule]) : { eligible: false };
              return (
                <li
                  key={String(t.id)}
                  className="flex items-center justify-between rounded p-4"
                  style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
                >
                  <div>
                    <p className="font-medium text-neutral-900">{String(t.name)}</p>
                    {rule && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        CGPA band: {rule.cgpa_lower}–{rule.cgpa_upper} | Team size: {rule.min_team_size}–{rule.max_team_size}
                      </p>
                    )}
                    {!eligibility.eligible && (
                      <p className="mt-1 text-xs text-red-600" role="alert">
                        Your CGPA ({studentCgpa}) is outside the required band.
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!eligibility.eligible}
                    isLoading={joiningTeam === String(t.id)}
                    onClick={() => handleJoin(String(t.id))}
                  >
                    Join
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Form new team */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Form a New Team</h2>
        <Card>
          <CardContent>
            <form onSubmit={handleFormTeam} className="flex flex-col gap-4">
              <FormError message={formError} />
              <Input
                label="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
                placeholder="Team Alpha"
                maxLength={100}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Formation Rule
                </label>
                <select
                  value={selectedRule}
                  onChange={(e) => setSelectedRule(e.target.value)}
                  required
                  className="block w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #d1d5db" }}
                >
                  <option value="">Select a rule…</option>
                  {(rules as unknown as TeamFormationRule[]).map((rule) => {
                    const eligible = checkEligibility(studentCgpa, [rule]).eligible;
                    return (
                      <option key={rule.id} value={rule.id} disabled={!eligible}>
                        CGPA {rule.cgpa_lower}–{rule.cgpa_upper} | {rule.min_team_size}–{rule.max_team_size} members{!eligible ? " (ineligible)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Button type="submit" variant="primary" isLoading={isForming} disabled={!selectedRule || !newTeamName}>
                Form Team
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
