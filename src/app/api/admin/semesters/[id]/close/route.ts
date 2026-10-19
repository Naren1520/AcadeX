import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError } from "@/lib/errors";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const { data, error } = await supabase
      .from("semesters")
      .update({ is_closed: true })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Semester not found.");
    return NextResponse.json({ semester: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
