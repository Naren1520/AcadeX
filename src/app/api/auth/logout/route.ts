import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function POST(request: Request) {
  try {
    const response = NextResponse.redirect(new URL("/login", request.url));
    const supabase = await createSupabaseRouteClient(response);

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

    // Redirect to login - cookies cleared by signOut are set on this response
    return response;
  } catch (err) {
    return toErrorResponse(err);
  }
}

// Handle accidental GET navigation (e.g. someone types the URL)
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}
