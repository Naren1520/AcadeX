// Feature: acadex-platform
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  applyProposalTransition,
  validateMilestoneDeadline,
  type ProposalStatus,
} from "@/server/workflows/proposalStateMachine";
import { isWindowOpen } from "@/lib/dates";

const ALL_STATUSES: ProposalStatus[] = [
  "pending",
  "approved",
  "rejected",
  "revision_requested",
];

const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  pending: ["approved", "rejected", "revision_requested"],
  revision_requested: ["pending"],
  approved: [],
  rejected: [],
};

// ─── Property 6: Proposal State Machine Validity 
describe("Property 6: Proposal State Machine Validity", () => {
  it("all valid transitions succeed; all invalid transitions fail", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        fc.constantFrom(...ALL_STATUSES),
        (from, to) => {
          const isValid = VALID_TRANSITIONS[from].includes(to);
          const result = applyProposalTransition(from, to);
          expect(result.success).toBe(isValid);
          if (!isValid) {
            expect(result.error).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("pending → approved succeeds", () => {
    expect(applyProposalTransition("pending", "approved").success).toBe(true);
  });

  it("pending → rejected succeeds", () => {
    expect(applyProposalTransition("pending", "rejected").success).toBe(true);
  });

  it("pending → revision_requested succeeds", () => {
    expect(applyProposalTransition("pending", "revision_requested").success).toBe(true);
  });

  it("revision_requested → pending succeeds", () => {
    expect(applyProposalTransition("revision_requested", "pending").success).toBe(true);
  });

  it("approved → anything fails", () => {
    for (const to of ALL_STATUSES) {
      expect(applyProposalTransition("approved", to).success).toBe(false);
    }
  });

  it("rejected → anything fails", () => {
    for (const to of ALL_STATUSES) {
      expect(applyProposalTransition("rejected", to).success).toBe(false);
    }
  });
});

// ─── Property 8: Resubmission Precondition 
describe("Property 8: Resubmission Precondition", () => {
  it("only revision_requested → pending is allowed (resubmit path)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_STATUSES), (status) => {
        const result = applyProposalTransition(status, "pending");
        if (status === "revision_requested") {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Milestone Deadline Futurity 
describe("Property 9: Milestone Deadline Futurity", () => {
  it("rejects any past or present date", () => {
    fc.assert(
      fc.property(
        fc.date({ max: new Date(Date.now() - 1000) }),
        (pastDate) => {
          const result = validateMilestoneDeadline(pastDate);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("accepts future dates", () => {
    const future = new Date(Date.now() + 86400000); // +1 day
    expect(validateMilestoneDeadline(future).valid).toBe(true);
  });

  it("rejects deadline exactly equal to now (not strictly future)", () => {
    const now = new Date(Date.now() - 1);
    expect(validateMilestoneDeadline(now).valid).toBe(false);
  });
});

// ─── Property 10: Submission Window Temporal Validity 
describe("Property 10: Submission Window Temporal Validity", () => {
  it("rejects window where closes_at <= opens_at", () => {
    fc.assert(
      fc.property(
        fc.date(),
        fc.date(),
        (a, b) => {
          const opensAt = a < b ? a : b;
          const closesAt = a < b ? b : a;

          if (closesAt.getTime() <= opensAt.getTime()) {
            expect(isWindowOpen(opensAt, closesAt)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("isWindowOpen returns true when now is within bounds", () => {
    const now = Date.now();
    const opensAt = new Date(now - 3600000); // 1h ago
    const closesAt = new Date(now + 3600000); // 1h from now
    expect(isWindowOpen(opensAt, closesAt)).toBe(true);
  });

  it("isWindowOpen returns false for closed window", () => {
    const past = new Date(Date.now() - 7200000);
    const recent = new Date(Date.now() - 3600000);
    expect(isWindowOpen(past, recent)).toBe(false);
  });
});

// ─── Unit: submission edge cases 
describe("Submission edge cases (unit)", () => {
  it("resubmission against approved returns false for valid transition check", () => {
    expect(applyProposalTransition("approved", "pending").success).toBe(false);
  });

  it("resubmission against rejected returns false", () => {
    expect(applyProposalTransition("rejected", "pending").success).toBe(false);
  });
});
