import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

const patchSchema = z.object({
  can_manage_students: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const { data: existing } = await supabase
      .from("faculty_assignments")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) throw new NotFoundError("Faculty assignment not found.");

    const { data, error } = await supabase
      .from("faculty_assignments")
      .update({ can_manage_students: parsed.data.can_manage_students })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ assignment: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const { data: existing } = await supabase
      .from("faculty_assignments")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) throw new NotFoundError("Faculty assignment not found.");

    const { error } = await supabase
      .from("faculty_assignments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
