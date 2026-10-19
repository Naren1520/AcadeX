import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";

const createSchema = z.object({
  academic_year_id: z.string().uuid(),
  label: z.string().min(1).max(50),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearId = searchParams.get("academicYearId");
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    let query = supabase.from("semesters").select("*, academic_years(label)").order("label");
    if (yearId) query = query.eq("academic_year_id", yearId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ semesters: data });
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

    // Validate parent year is not closed
    const { data: year } = await supabase
      .from("academic_years")
      .select("is_closed, label")
      .eq("id", parsed.data.academic_year_id)
      .single();

    if (year?.is_closed) {
      throw new ValidationError(
        `Cannot create semester: academic year "${year.label}" is closed.`,
        { academic_year_id: "Academic year is closed." }
      );
    }

    const { data, error } = await supabase
      .from("semesters")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ConflictError("A semester with this label already exists in this academic year.", "label");
      throw error;
    }
    return NextResponse.json({ semester: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
