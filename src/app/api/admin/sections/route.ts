import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";

const createSchema = z.object({
  semester_id: z.string().uuid(),
  department_id: z.string().uuid(),
  label: z.string().min(1).max(20),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get("semesterId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    let query = supabase
      .from("sections")
      .select("*, semesters(label), departments(name, code)")
      .order("label");
    if (semesterId) query = query.eq("semester_id", semesterId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ sections: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);
    }

    // Validate parent semester is not closed
    const { data: semester } = await supabase
      .from("semesters")
      .select("is_closed, label")
      .eq("id", parsed.data.semester_id)
      .single();

    if (semester?.is_closed) {
      throw new ValidationError(
        `Cannot create section: semester "${semester.label}" is closed.`,
        { semester_id: "Semester is closed." }
      );
    }

    const { data, error } = await supabase
      .from("sections")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ConflictError("A section with this label already exists for this semester and department.", "label");
      throw error;
    }
    return NextResponse.json({ section: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
