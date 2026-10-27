import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  pending: ["approved", "rejected", "revision_requested"],
  revision_requested: ["pending"],
  approved: [],
  rejected: [],
};

/**
 * Pure FSM transition validator.
 * Returns { success: true } for valid transitions, { success: false, error } for invalid.
 */
export function applyProposalTransition(
  from: ProposalStatus,
  to: ProposalStatus
): { success: boolean; error?: string } {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  if (allowed.includes(to)) {
    return { success: true };
  }
  return {
    success: false,
    error: `Cannot transition proposal from "${from}" to "${to}".`,
  };
}

/**
 * Returns the count of active (pending or revision_requested) proposals for a team.
 * Used to enforce the single-active-proposal constraint.
 */
export async function checkSingleActiveProposal(
  teamId: string,
  supabase: SupabaseClient<Database>
): Promise<number> {
  const { count, error } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId)
    .in("status", ["pending", "revision_requested"]);

  if (error) {
    console.error("[ProposalFSM] Error checking active proposals:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Validates a milestone deadline - must be strictly in the future.
 */
export function validateMilestoneDeadline(deadline: Date): {
  valid: boolean;
  error?: string;
} {
  if (deadline.getTime() <= Date.now()) {
    return {
      valid: false,
      error: "Milestone deadline must be a future date.",
    };
  }
  return { valid: true };
}
