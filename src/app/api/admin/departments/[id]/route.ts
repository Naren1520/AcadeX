import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError, ValidationError } from "@/lib/errors";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  is_active: z.boolean().optional(),
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

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    const { data, error } = await supabase
      .from("departments")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Department not found.");
    return NextResponse.json({ department: data });
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

    // Check for active sections
    const { count: sectionCount } = await supabase
      .from("sections")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id);

    // Check for student records
    const { count: studentCount } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id);

    const errors: string[] = [];
    if ((sectionCount ?? 0) > 0) errors.push("active sections exist");
    if ((studentCount ?? 0) > 0) errors.push("student records exist");

    if (errors.length > 0) {
      throw new ValidationError(
        `Cannot delete department: ${errors.join(" and ")}.`,
        { department: errors.join("; ") }
      );
    }

    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
