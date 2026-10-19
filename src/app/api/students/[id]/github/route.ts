import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserWithRole, requireOwnerOrAdmin } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { githubProfileSchema } from "@/lib/validation";

const updateSchema = z.object({ github_url: githubProfileSchema });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await getAuthenticatedUserWithRole(supabase);
    await requireOwnerOrAdmin(supabase, userId, studentId);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data, error } = await supabase
      .from("students")
      .update({ github_url: parsed.data.github_url })
      .eq("id", studentId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Student record not found.");
    return NextResponse.json({ student: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
