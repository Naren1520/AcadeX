// Feature: acadex-platform
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  checkEligibility,
  validateRuleBands,
  type TeamFormationRule,
} from "@/server/workflows/teamFormationEngine";

function makeRule(overrides: Partial<TeamFormationRule> = {}): TeamFormationRule {
  return {
    id: "rule-1",
    cgpa_lower: 6.0,
    cgpa_upper: 10.0,
    min_team_size: 2,
    max_team_size: 4,
    max_teams: 5,
    is_enabled: true,
    ...overrides,
  };
}

// ─── Property 1: CGPA Band Validity Invariant ──────────────────────────────
describe("Property 1: CGPA Band Validity Invariant", () => {
  it("validates when upper >= lower and both in [0,10]", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        fc.float({ min: 0, max: 10, noNaN: true }),
        (a, b) => {
          const lower = Math.min(a, b);
          const upper = Math.max(a, b);
          const result = validateRuleBands(lower, upper);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rejects when upper < lower", () => {
    const result = validateRuleBands(8.0, 5.0);
    expect(result.valid).toBe(false);
  });

  it("rejects when bounds are outside [0, 10]", () => {
    expect(validateRuleBands(-1, 5).valid).toBe(false);
    expect(validateRuleBands(5, 11).valid).toBe(false);
  });
});

// ─── Property 2: Student CGPA Eligibility ──────────────────────────────────
describe("Property 2: Student CGPA Eligibility", () => {
  it("returns ineligible when CGPA falls outside all rule bands", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10, noNaN: true }),
        fc.array(
          fc.record({
            cgpaLower: fc.float({ min: 0, max: 9, noNaN: true }),
            cgpaUpper: fc.float({ min: 0, max: 10, noNaN: true }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (studentCgpa, rawRules) => {
          const rules: TeamFormationRule[] = rawRules.map((r, i) => ({
            id: `rule-${i}`,
            cgpa_lower: Math.min(r.cgpaLower, r.cgpaUpper),
            cgpa_upper: Math.max(r.cgpaLower, r.cgpaUpper),
            min_team_size: 2,
            max_team_size: 4,
            max_teams: 5,
            is_enabled: true,
          }));

          const actuallyEligible = rules.some(
            (r) => studentCgpa >= r.cgpa_lower && studentCgpa <= r.cgpa_upper
          );
          const { eligible } = checkEligibility(studentCgpa, rules);
          expect(eligible).toBe(actuallyEligible);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns eligible for CGPA at lower boundary (inclusive)", () => {
    const rule = makeRule({ cgpa_lower: 6.0, cgpa_upper: 9.0 });
    expect(checkEligibility(6.0, [rule]).eligible).toBe(true);
  });

  it("returns eligible for CGPA at upper boundary (inclusive)", () => {
    const rule = makeRule({ cgpa_lower: 6.0, cgpa_upper: 9.0 });
    expect(checkEligibility(9.0, [rule]).eligible).toBe(true);
  });

  it("returns ineligible for CGPA just outside band", () => {
    const rule = makeRule({ cgpa_lower: 6.0, cgpa_upper: 9.0 });
    expect(checkEligibility(5.99, [rule]).eligible).toBe(false);
    expect(checkEligibility(9.01, [rule]).eligible).toBe(false);
  });

  it("returns ineligible when rule is disabled", () => {
    const rule = makeRule({ cgpa_lower: 6.0, cgpa_upper: 10.0, is_enabled: false });
    expect(checkEligibility(8.0, [rule]).eligible).toBe(false);
  });
});

// ─── Unit: edge cases ──────────────────────────────────────────────────────
describe("Team formation edge cases", () => {
  it("matches correct rule when multiple rules exist", () => {
    const rules = [
      makeRule({ id: "r1", cgpa_lower: 0, cgpa_upper: 5 }),
      makeRule({ id: "r2", cgpa_lower: 6, cgpa_upper: 8 }),
      makeRule({ id: "r3", cgpa_lower: 8.5, cgpa_upper: 10 }),
    ];
    const { eligible, matchingRule } = checkEligibility(7.0, rules);
    expect(eligible).toBe(true);
    expect(matchingRule?.id).toBe("r2");
  });

  it("returns no matching rule when ineligible", () => {
    const rules = [makeRule({ cgpa_lower: 8, cgpa_upper: 10 })];
    const { eligible, matchingRule } = checkEligibility(7.0, rules);
    expect(eligible).toBe(false);
    expect(matchingRule).toBeUndefined();
  });
});
