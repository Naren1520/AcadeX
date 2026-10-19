import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError } from "@/lib/errors";

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
