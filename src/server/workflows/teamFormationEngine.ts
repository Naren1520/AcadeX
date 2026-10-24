import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { ConflictError, ValidationError } from "@/lib/errors";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications } from "@/server/notifications";

// ── Types ─────────────────────────────────────────────────────
export interface SlotDefinition {
  cgpa_lower: number;
  cgpa_upper: number;
  count: number;
  label: string;
}

export interface TeamFormationRule {
  id: string;
  is_enabled: boolean;
  max_teams: number;
  // new slot-based fields (optional for legacy compat)
  label?: string;
  team_size?: number;
  formed_count?: number;
  team_formation_slots?: SlotDefinition[];
  // legacy single-band fields (optional for new compat)
  cgpa_lower?: number;
  cgpa_upper?: number;
  min_team_size?: number;
  max_team_size?: number;
}

export interface FormTeamRequest {
  studentId: string;
  sectionId: string;
  ruleId: string;
  teamName: string;
}

export interface JoinTeamRequest {
  studentId: string;
  teamId: string;
  sectionId: string;
}

// ── Pure helpers ──────────────────────────────────────────────

/**
 * Returns the slot this student's CGPA matches, or null if none.
 */
export function findMatchingSlot(
  studentCgpa: number,
  slots: SlotDefinition[]
): SlotDefinition | null {
  return slots.find((s) => studentCgpa >= s.cgpa_lower && studentCgpa <= s.cgpa_upper) ?? null;
}

/**
 * Check whether a student is eligible for at least one slot in the rule.
 */
export function checkEligibility(
  studentCgpa: number,
  rules: TeamFormationRule[]
): { eligible: boolean; matchingRule?: TeamFormationRule } {
  const matchingRule = rules.find((r) => {
    if (!r.is_enabled) return false;
    // New slot-based check
    if (r.team_formation_slots?.length) {
      return findMatchingSlot(studentCgpa, r.team_formation_slots) !== null;
    }
    // Legacy band check
    return studentCgpa >= (r.cgpa_lower ?? 0) && studentCgpa <= (r.cgpa_upper ?? 10);
  });
  return matchingRule ? { eligible: true, matchingRule } : { eligible: false };
}

/**
 * Validates that slot counts sum to team_size.
 */
export function validateSlots(
  teamSize: number,
  slots: SlotDefinition[]
): { valid: boolean; error?: string } {
  const total = slots.reduce((s, slot) => s + slot.count, 0);
  if (total !== teamSize) {
    return { valid: false, error: `Slot counts (${total}) must equal team_size (${teamSize}).` };
  }
  for (const s of slots) {
    if (s.cgpa_upper < s.cgpa_lower) {
      return { valid: false, error: `cgpa_upper (${s.cgpa_upper}) must be >= cgpa_lower (${s.cgpa_lower}).` };
    }
  }
  return { valid: true };
}

/** Legacy band validation — kept for backward compat */
export function validateRuleBands(
  cgpaLower: number,
  cgpaUpper: number
): { valid: boolean; error?: string } {
  if (cgpaUpper < cgpaLower) return { valid: false, error: "CGPA upper must be >= lower." };
  if (cgpaLower < 0 || cgpaUpper > 10) return { valid: false, error: "CGPA bounds must be within [0, 10]." };
  return { valid: true };
}

/**
 * Check whether the current team membership satisfies the slot composition.
 * Returns which slots still need members.
 */
async function getSlotSatisfaction(
  supabase: ReturnType<typeof getSupabaseServiceRoleClient>,
  teamId: string,
  slots: SlotDefinition[]
): Promise<{ satisfied: boolean; remaining: SlotDefinition[] }> {
  const { data: members } = await supabase
    .from("team_members")
    .select("student_id, students(cgpa)")
    .eq("team_id", teamId);

  const memberCgpas: number[] = (members ?? []).map((m: unknown) => {
    const row = m as { students: { cgpa: number } | null };
    return row.students?.cgpa ?? 0;
  });

  // Count how many members already satisfy each slot
  const remaining: SlotDefinition[] = [];
  const usedIndices = new Set<number>();

  for (const slot of slots) {
    let needed = slot.count;
    for (let i = 0; i < memberCgpas.length; i++) {
      if (!usedIndices.has(i) && memberCgpas[i] >= slot.cgpa_lower && memberCgpas[i] <= slot.cgpa_upper) {
        usedIndices.add(i);
        needed--;
        if (needed === 0) break;
      }
    }
    if (needed > 0) {
      remaining.push({ ...slot, count: needed });
    }
  }

  return { satisfied: remaining.length === 0, remaining };
}

// ── Team formation ────────────────────────────────────────────

export async function formTeam(req: FormTeamRequest): Promise<{ id: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: student } = await supabase
    .from("students").select("cgpa").eq("id", req.studentId).single();
  if (!student) throw new ValidationError("Student record not found.");

  const { data: rule } = await supabase
    .from("team_formation_rules")
    .select("*, team_formation_slots(*)")
    .eq("id", req.ruleId).eq("is_enabled", true).single();
  if (!rule) throw new ValidationError("Team formation rule not found or is disabled.");

  // Check student is eligible for at least one slot
  const slots: SlotDefinition[] = rule.team_formation_slots ?? [];
  if (slots.length > 0) {
    const match = findMatchingSlot(student.cgpa, slots);
    if (!match) {
      throw new ValidationError(
        `Your CGPA (${student.cgpa}) does not match any required band in this rule.`
      );
    }
  }

  // Quota check — use formed_count for fast check
  if (rule.formed_count >= rule.max_teams) {
    throw new ValidationError(`Maximum teams (${rule.max_teams}) under this rule has been reached.`);
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ section_id: req.sectionId, rule_id: req.ruleId, name: req.teamName, status: "forming" })
    .select("id").single();

  if (teamError || !team) throw new Error(`Failed to create team: ${teamError?.message}`);

  await supabase.from("team_members").insert({
    team_id: team.id, student_id: req.studentId, is_lead: true,
  });

  await writeAuditLog({
    actorId: req.studentId, actorRole: "student",
    actionType: AuditEventTypes.TEAM_FORMED,
    targetTable: "teams", targetRecordId: team.id,
    newValue: { teamName: req.teamName, ruleId: req.ruleId },
  });

  return { id: team.id };
}

export async function joinTeam(req: JoinTeamRequest): Promise<{ id: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: student } = await supabase
    .from("students").select("cgpa").eq("id", req.studentId).single();
  if (!student) throw new ValidationError("Student record not found.");

  const { data: team } = await supabase
    .from("teams")
    .select("id, rule_id, status, team_formation_rules(*, team_formation_slots(*))")
    .eq("id", req.teamId).single();
  if (!team) throw new ValidationError("Team not found.");

  if (team.status === "confirmed" || team.status === "dissolved") {
    throw new ConflictError(`Cannot join a team that is ${team.status}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rule = (team as any).team_formation_rules as TeamFormationRule;
  const slots: SlotDefinition[] = rule.team_formation_slots ?? [];

  // Check current member count vs team_size
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", req.teamId);

  const teamSize = rule.team_size ?? rule.max_team_size ?? 4;
  if ((memberCount ?? 0) >= teamSize) {
    throw new ConflictError(`This team is full (size ${teamSize}).`);
  }

  // Check this student's CGPA fills a remaining slot
  if (slots.length > 0) {
    const { remaining } = await getSlotSatisfaction(supabase, req.teamId, slots);
    const fitsRemaining = remaining.some(
      (s) => student.cgpa >= s.cgpa_lower && student.cgpa <= s.cgpa_upper
    );
    if (!fitsRemaining) {
      const bands = remaining
        .map((s) => `${s.count}× CGPA ${s.cgpa_lower}–${s.cgpa_upper}${s.label ? ` (${s.label})` : ""}`)
        .join(", ");
      throw new ValidationError(
        `Your CGPA (${student.cgpa}) does not fill any remaining slot in this team. Still needed: ${bands}`
      );
    }
  }

  const { error: insertError } = await supabase.from("team_members").insert({
    team_id: req.teamId, student_id: req.studentId, is_lead: false,
  });

  if (insertError) {
    if (insertError.code === "23505") throw new ConflictError("You are already in a team.");
    throw new Error(`Failed to join team: ${insertError.message}`);
  }

  const newCount = (memberCount ?? 0) + 1;

  // Confirm team when all slots are satisfied
  if (slots.length > 0) {
    const { satisfied } = await getSlotSatisfaction(supabase, req.teamId, slots);
    if (satisfied) {
      await supabase.from("teams").update({ status: "confirmed" }).eq("id", req.teamId);
      // Increment formed_count on rule
      await supabase
        .from("team_formation_rules")
        .update({ formed_count: (rule.formed_count ?? 0) + 1 })
        .eq("id", rule.id);
    }
  } else {
    // Legacy: confirm when min_team_size reached
    if (newCount >= (rule.min_team_size ?? 1)) {
      await supabase.from("teams").update({ status: "confirmed" }).eq("id", req.teamId);
    }
  }

  await writeAuditLog({
    actorId: req.studentId, actorRole: "student",
    actionType: AuditEventTypes.TEAM_MEMBER_ADDED,
    targetTable: "team_members", targetRecordId: req.teamId,
    newValue: { studentId: req.studentId },
  });

  sendInAppNotifications({
    recipientIds: [req.studentId],
    message: "You have successfully joined the team.",
    deepLink: `/student/teams/${req.teamId}`,
    triggerEvent: "team.membership_changed",
  }).catch(console.error);

  return { id: req.teamId };
}
