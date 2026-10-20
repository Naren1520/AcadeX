import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

const updateSchema = z.object({
  section_id:    z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().optional(),
  cgpa:          z.number().min(0).max(10).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) throw new NotFoundError("Student not found.");

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
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ student: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
