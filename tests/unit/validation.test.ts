// Feature: acadex-platform
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { cgpaSchema, usnSchema, githubProfileSchema, githubRepoSchema } from "@/lib/validation";
import { validateFileUpload } from "@/server/storage";
import { ALLOWED_MIME_TYPES } from "@/lib/constants/storage";
import type { ArtefactCategory } from "@/lib/constants/storage";

// ─── Property 15: CGPA Numeric Bounds ──────────────────────────────────────
// For any CGPA value outside [0.00, 10.00], cgpaSchema.safeParse must fail.
describe("Property 15: CGPA Numeric Bounds", () => {
  it("rejects any value below 0", () => {
    fc.assert(
      fc.property(fc.float({ max: Math.fround(-0.001), noNaN: true }), (v) => {
        const result = cgpaSchema.safeParse(v);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("rejects any value above 10", () => {
    fc.assert(
      fc.property(fc.float({ min: Math.fround(10.001), noNaN: true }), (v) => {
        const result = cgpaSchema.safeParse(v);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("accepts boundary values 0 and 10", () => {
    expect(cgpaSchema.safeParse(0).success).toBe(true);
    expect(cgpaSchema.safeParse(10).success).toBe(true);
    expect(cgpaSchema.safeParse(7.5).success).toBe(true);
  });
});

// ─── Property 14: USN Uniqueness Format ────────────────────────────────────
describe("Property 14: USN Format Validation", () => {
  it("accepts exactly 10 alphanumeric characters", () => {
    expect(usnSchema.safeParse("1RF21CS042").success).toBe(true);
    expect(usnSchema.safeParse("ABCDEFGHIJ").success).toBe(true);
    expect(usnSchema.safeParse("1234567890").success).toBe(true);
  });

  it("rejects USNs that are not exactly 10 alphanumeric chars", () => {
    expect(usnSchema.safeParse("1RF21CS04").success).toBe(false);   // 9 chars
    expect(usnSchema.safeParse("1RF21CS0422").success).toBe(false); // 11 chars
    expect(usnSchema.safeParse("1RF21CS04!").success).toBe(false);  // special char
    expect(usnSchema.safeParse("").success).toBe(false);
  });

  it("rejects strings of wrong length via fast-check", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.length !== 10 || !/^[A-Za-z0-9]{10}$/.test(s)),
        (s) => {
          const result = usnSchema.safeParse(s);
          // strings that don't match the pattern must fail
          if (!/^[A-Za-z0-9]{10}$/.test(s)) {
            expect(result.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 11: File MIME Type Enforcement ───────────────────────────────
describe("Property 11: File MIME Type Enforcement", () => {
  const categories: ArtefactCategory[] = ["resume", "ppt", "report"];

  it("rejects any MIME type not in the permitted list", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...categories),
        fc.string({ minLength: 1, maxLength: 80 }),
        (category, mimeType) => {
          const allowed = ALLOWED_MIME_TYPES[category];
          if (!allowed.includes(mimeType)) {
            const result = validateFileUpload(mimeType, 1024, category);
            expect(result.valid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("accepts valid MIME types", () => {
    expect(validateFileUpload("application/pdf", 1024, "resume").valid).toBe(true);
    expect(validateFileUpload("application/pdf", 1024, "report").valid).toBe(true);
    expect(
      validateFileUpload(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        1024,
        "ppt"
      ).valid
    ).toBe(true);
  });
});

// ─── Property 12: File Size Enforcement ────────────────────────────────────
describe("Property 12: File Size Enforcement", () => {
  it("rejects files exceeding category size limits", () => {
    const limits: Record<ArtefactCategory, number> = {
      resume: 20 * 1024 * 1024,
      ppt: 100 * 1024 * 1024,
      report: 50 * 1024 * 1024,
    };

    fc.assert(
      fc.property(
        fc.constantFrom("resume" as ArtefactCategory, "ppt" as ArtefactCategory, "report" as ArtefactCategory),
        fc.integer({ min: 1, max: 50 }),
        (category, extraMb) => {
          const overLimit = limits[category] + extraMb * 1024 * 1024;
          const result = validateFileUpload("application/pdf", overLimit, category);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("accepts files within size limits", () => {
    expect(validateFileUpload("application/pdf", 1024 * 1024, "resume").valid).toBe(true);
    expect(validateFileUpload("application/pdf", 10 * 1024 * 1024, "report").valid).toBe(true);
  });
});

// ─── GitHub URL validation ──────────────────────────────────────────────────
describe("GitHub URL Schemas", () => {
  it("profileSchema accepts valid profile URLs", () => {
    expect(githubProfileSchema.safeParse("https://github.com/username").success).toBe(true);
    expect(githubProfileSchema.safeParse("https://github.com/user-name_123").success).toBe(true);
  });

  it("profileSchema rejects repo URLs (has two path segments)", () => {
    expect(githubProfileSchema.safeParse("https://github.com/owner/repo").success).toBe(false);
    expect(githubProfileSchema.safeParse("https://gitlab.com/user").success).toBe(false);
    expect(githubProfileSchema.safeParse("http://github.com/user").success).toBe(false);
  });

  it("repoSchema accepts valid repo URLs", () => {
    expect(githubRepoSchema.safeParse("https://github.com/owner/repo").success).toBe(true);
    expect(githubRepoSchema.safeParse("https://github.com/org/my-repo_123").success).toBe(true);
  });

  it("repoSchema rejects profile-only URLs", () => {
    expect(githubRepoSchema.safeParse("https://github.com/owner").success).toBe(false);
    expect(githubRepoSchema.safeParse("https://github.com/").success).toBe(false);
  });
});
