/**
 * Type-safe row extractor for Supabase query results.
 *
 * Supabase's TypeScript inference can narrow certain query results to `never`
 * when the generated DB types don't perfectly align with the query shape.
 * This helper provides a clean escape hatch while preserving type safety
 * at the call site.
 *
 * Usage:
 *   const row = asRow<{ role: string }>(data);
 *   const rows = asRows<{ id: string; name: string }>(data);
 */

export function asRow<T>(data: unknown): T | null {
  return data as T | null;
}

export function asRows<T>(data: unknown): T[] {
  if (!data) return [];
  return data as T[];
}
