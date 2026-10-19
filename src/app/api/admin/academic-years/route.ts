import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";

const createSchema = z.object({
  label: z.string().min(1).max(20),
});

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);
    const { data, error } = await supabase
      .from("academic_years")
      .select("*")
      .order("label", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ academicYears: data });
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

    const { data, error } = await supabase
      .from("academic_years")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ConflictError("An academic year with this label already exists.", "label");
      throw error;
    }
    return NextResponse.json({ academicYear: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
