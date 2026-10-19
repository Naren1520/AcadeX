import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserWithRole, requireOwnerOrAdmin } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { NotFoundError } from "@/lib/errors";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await getAuthenticatedUserWithRole(supabase);

    const { data: notif } = await supabase
      .from("notifications")
      .select("recipient_id")
      .eq("id", id)
      .single();

    if (!notif) throw new NotFoundError("Notification not found.");
    await requireOwnerOrAdmin(supabase, userId, notif.recipient_id);

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ notification: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
