import { z } from "zod";

/** RFC 5322 email validation */
export const emailSchema = z
  .string()
  .email("Must be a valid email address.");

/** USN — exactly 10 alphanumeric characters */
export const usnSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9]{10}$/,
    "USN must be exactly 10 alphanumeric characters."
  );

/** CGPA — numeric range [0.00, 10.00] */
export const cgpaSchema = z
  .number()
  .min(0, "CGPA must be at least 0.00.")
  .max(10, "CGPA must not exceed 10.00.");

/** GitHub profile URL — https://github.com/{username} */
export const githubProfileSchema = z
  .string()
  .regex(
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+$/,
    "Must be a valid GitHub profile URL: https://github.com/{username}."
  );

/** GitHub repository URL — https://github.com/{owner}/{repo} */
export const githubRepoSchema = z
  .string()
  .regex(
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
    "Must be a valid GitHub repository URL: https://github.com/{owner}/{repo}."
  );

/** Skills list — max 20 items, each ≤50 chars */
export const skillsSchema = z
  .array(z.string().max(50, "Each skill must not exceed 50 characters."))
  .max(20, "Skills list must not exceed 20 items.");

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

/** SDG number — 1 through 17 */
export const sdgNumberSchema = z
  .number()
  .int()
  .min(1, "SDG number must be between 1 and 17.")
  .max(17, "SDG number must be between 1 and 17.");
