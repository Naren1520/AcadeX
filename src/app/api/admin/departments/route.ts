import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ConflictError, ValidationError } from "@/lib/errors";
import { writeAuditLog, AuditEventTypes, extractRequestMeta } from "@/server/audit";

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20).toUpperCase(),
});

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) throw error;
    return NextResponse.json({ departments: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["admin"]);
    const { ipAddress, userAgent } = extractRequestMeta(request);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const { data, error } = await supabase.from("departments").insert(parsed.data).select().single();
    if (error) {
      if (error.code === "23505") throw new ConflictError("A department with this name or code already exists.", "code");
      throw error;
    }

    writeAuditLog({ actorId: userId, actorRole: "admin", actionType: AuditEventTypes.DEPARTMENT_CREATED, targetTable: "departments", targetRecordId: data.id, newValue: parsed.data, ipAddress, userAgent });

    return NextResponse.json({ department: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
