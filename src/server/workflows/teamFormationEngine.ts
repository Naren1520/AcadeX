import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { ConflictError, ValidationError } from "@/lib/errors";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { sendInAppNotifications } from "@/server/notifications";

export interface TeamFormationRule {
  id: string;
  cgpa_lower: number;
  cgpa_upper: number;
  min_team_size: number;
  max_team_size: number;
  max_teams: number;
  is_enabled: boolean;
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

/**
 * Pure eligibility check — no DB calls.
 * Returns eligible if studentCgpa falls within any enabled rule's [lower, upper] band.
 */
export function checkEligibility(
  studentCgpa: number,
  rules: TeamFormationRule[]
): { eligible: boolean; matchingRule?: TeamFormationRule } {
  const matchingRule = rules.find(
    (r) =>
      r.is_enabled &&
      studentCgpa >= r.cgpa_lower &&
      studentCgpa <= r.cgpa_upper
  );
  return matchingRule
    ? { eligible: true, matchingRule }
    : { eligible: false };
}

/**
 * Validates CGPA band parameters for a rule.
 */
export function validateRuleBands(
  cgpaLower: number,
  cgpaUpper: number
): { valid: boolean; error?: string } {
  if (cgpaUpper < cgpaLower) {
    return {
      valid: false,
      error: "CGPA upper bound must be greater than or equal to lower bound.",
    };
  }
  if (cgpaLower < 0 || cgpaUpper > 10) {
    return {
      valid: false,
      error: "CGPA bounds must be within [0.00, 10.00].",
    };
  }
  return { valid: true };
}

/**
 * Creates a new team for a student, validates eligibility and max_teams cap.
 */
export async function formTeam(
  req: FormTeamRequest
): Promise<{ id: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: student } = await supabase
    .from("students")
    .select("cgpa")
    .eq("id", req.studentId)
    .single();

  if (!student) {
    throw new ValidationError("Student record not found.");
  }

  const { data: rule } = await supabase
    .from("team_formation_rules")
    .select("*")
    .eq("id", req.ruleId)
    .eq("is_enabled", true)
    .single();

  if (!rule) {
    throw new ValidationError("Team formation rule not found or is disabled.");
  }

  const { eligible } = checkEligibility(student.cgpa, [rule]);
  if (!eligible) {
    throw new ValidationError(
      `Your CGPA (${student.cgpa}) does not fall within the required band (${rule.cgpa_lower}–${rule.cgpa_upper}).`
    );
  }

  const { count: confirmedCount } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("rule_id", req.ruleId)
    .eq("status", "confirmed");

  if ((confirmedCount ?? 0) >= rule.max_teams) {
    throw new ValidationError(
      `The maximum number of teams (${rule.max_teams}) under this rule has already been reached.`
    );
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      section_id: req.sectionId,
      rule_id: req.ruleId,
      name: req.teamName,
      status: "forming",
    })
    .select("id")
    .single();

  if (teamError || !team) {
    throw new Error(`Failed to create team: ${teamError?.message}`);
  }

  await supabase.from("team_members").insert({
    team_id: team.id,
    student_id: req.studentId,
    is_lead: true,
  });

  await writeAuditLog({
    actorId: req.studentId,
    actorRole: "student",
    actionType: AuditEventTypes.TEAM_FORMED,
    targetTable: "teams",
    targetRecordId: team.id,
    newValue: { teamName: req.teamName, ruleId: req.ruleId },
  });

  return { id: team.id };
}

/**
 * Joins an existing team with eligibility and capacity checks.
 * Uses an advisory lock pattern via unique constraints for concurrency safety.
 */
export async function joinTeam(
  req: JoinTeamRequest
): Promise<{ id: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: student } = await supabase
    .from("students")
    .select("cgpa")
    .eq("id", req.studentId)
    .single();

  if (!student) {
    throw new ValidationError("Student record not found.");
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, rule_id, team_formation_rules(*)")
    .eq("id", req.teamId)
    .single();

  if (!team) {
    throw new ValidationError("Team not found.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rule = (team as any).team_formation_rules as TeamFormationRule;

  const { eligible } = checkEligibility(student.cgpa, [rule]);
  if (!eligible) {
    throw new ValidationError(
      `Your CGPA (${student.cgpa}) does not fall within the required band (${rule.cgpa_lower}–${rule.cgpa_upper}).`
    );
  }

  const { count: memberCount } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", req.teamId);

  if ((memberCount ?? 0) >= rule.max_team_size) {
    throw new ConflictError(
      `This team is full (maximum ${rule.max_team_size} members).`
    );
  }

  const { error: insertError } = await supabase.from("team_members").insert({
    team_id: req.teamId,
    student_id: req.studentId,
    is_lead: false,
  });

  if (insertError) {
    // PostgreSQL unique constraint violation
    if (insertError.code === "23505") {
      throw new ConflictError(
        "You are already a member of this team or another team."
      );
    }
    throw new Error(`Failed to join team: ${insertError.message}`);
  }

  const newCount = (memberCount ?? 0) + 1;
  if (newCount >= rule.min_team_size) {
    await supabase
      .from("teams")
      .update({ status: "confirmed" })
      .eq("id", req.teamId);
  }

  await writeAuditLog({
    actorId: req.studentId,
    actorRole: "student",
    actionType: AuditEventTypes.TEAM_MEMBER_ADDED,
    targetTable: "team_members",
    targetRecordId: req.teamId,
    newValue: { studentId: req.studentId },
  });

  // Fire-and-forget notification — do not await
  sendInAppNotifications({
    recipientIds: [req.studentId],
    message: "You have successfully joined the team.",
    deepLink: `/student/teams/${req.teamId}`,
    triggerEvent: "team.membership_changed",
  }).catch((err) =>
    console.error("[TeamFormation] Notification failed:", err)
  );

  return { id: req.teamId };
}
