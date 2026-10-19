// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthError, ForbiddenError } from "@/lib/errors";

export type Role = "admin" | "faculty" | "student";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any>;

/**
 * Reads the role from the `profiles` table for the authenticated session user.
 * Throws HTTP 401 if unauthenticated.
 * Throws HTTP 403 if role is null or unrecognised.
 */
export async function getAuthenticatedUserWithRole(
  supabase: AnySupabaseClient
): Promise<{ userId: string; role: Role }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError();
  }

  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as { role: string } | null;

  if (profileError || !profile) {
    throw new ForbiddenError("User profile not found.");
  }

  const role = profile.role as Role;
  if (!["admin", "faculty", "student"].includes(role)) {
    throw new ForbiddenError("Unrecognised user role.");
  }

  return { userId: user.id, role };
}

/**
 * Throws HTTP 403 if the authenticated user's role is not in the allowed list.
 */
export async function requireRole(
  supabase: AnySupabaseClient,
  allowed: Role[]
): Promise<{ userId: string; role: Role }> {
  const { userId, role } = await getAuthenticatedUserWithRole(supabase);

  if (!allowed.includes(role)) {
    throw new ForbiddenError(
      `This action requires one of the following roles: ${allowed.join(", ")}.`
    );
  }

  return { userId, role };
}

/**
 * Throws HTTP 403 if the faculty member has no assignment record
 * linking them to the given departmentId or sectionId.
 */
export async function requireFacultyAssignment(
  supabase: AnySupabaseClient,
  facultyId: string,
  context: { departmentId?: string; sectionId?: string }
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("faculty_assignments")
    .select("id")
    .eq("faculty_id", facultyId);

  if (context.departmentId) {
    query = query.eq("department_id", context.departmentId);
  }
  if (context.sectionId) {
    query = query.eq("section_id", context.sectionId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    throw new ForbiddenError(
      "You do not have an assignment to this section or department."
    );
  }
}

/**
 * Throws HTTP 403 unless userId matches resourceOwnerId or the user is admin.
 */
export async function requireOwnerOrAdmin(
  supabase: AnySupabaseClient,
  userId: string,
  resourceOwnerId: string
): Promise<void> {
  if (userId === resourceOwnerId) return;

  const { data: profileRaw, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const profile = profileRaw as { role: string } | null;

  if (error || !profile || profile.role !== "admin") {
    throw new ForbiddenError(
      "You do not have permission to access this resource."
    );
  }
}
