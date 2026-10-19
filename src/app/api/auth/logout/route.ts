import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileRaw } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      const profile = profileRaw as { role: string } | null;

      writeAuditLog({
        actorId: user.id,
        actorRole: (profile?.role as "admin" | "faculty" | "student") ?? "student",
        actionType: AuditEventTypes.USER_LOGOUT,
        targetTable: "profiles",
        targetRecordId: user.id,
      });
    }

    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
