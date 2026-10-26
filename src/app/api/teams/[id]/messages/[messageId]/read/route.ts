import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student", "faculty"]);

    const service = getSupabaseServiceRoleClient();
    await service.from("team_message_reads")
      .upsert({ message_id: messageId, user_id: userId }, { onConflict: "message_id,user_id" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
