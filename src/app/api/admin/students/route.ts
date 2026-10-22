import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId    = searchParams.get("sectionId");
    const departmentId = searchParams.get("departmentId");

    const supabase = await getSupabaseServerClient();
    // Allow both admin and faculty to call this
    await requireRole(supabase, ["admin", "faculty"]);

    let query = supabase
      .from("students")
      .select("id, usn, cgpa, section_id, profiles(full_name, email)")
      .order("usn");

    if (sectionId)    query = query.eq("section_id", sectionId);
    if (departmentId) query = query.eq("department_id", departmentId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ students: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
