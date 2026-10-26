import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

const editSchema = z.object({ content: z.string().min(1).max(2000).trim() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: teamId, messageId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student", "faculty"]);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const service = getSupabaseServiceRoleClient();
    const { data, error } = await service
      .from("team_messages")
      .update({ content: parsed.data.content, edited_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", userId)
      .eq("team_id", teamId)
      .eq("is_deleted", false)
      .select("id, content, is_deleted, edited_at, created_at, sender_id, reply_to_id, profiles!team_messages_sender_id_fkey(full_name), team_message_reads(user_id)")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new ForbiddenError("Cannot edit this message.");
    const shaped = {
      ...data,
      read_by: ((data.team_message_reads as { user_id: string }[] | null) ?? []).map((r: { user_id: string }) => r.user_id),
      sender_name: (data.profiles as unknown as { full_name: string } | null)?.full_name ?? "Unknown",
    };
    return NextResponse.json({ message: shaped });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: teamId, messageId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId } = await requireRole(supabase, ["student", "faculty"]);

    const service = getSupabaseServiceRoleClient();

    const { data: msg } = await service
      .from("team_messages").select("sender_id").eq("id", messageId).single();
    if (!msg) throw new NotFoundError("Message not found.");
    if (msg.sender_id !== userId) throw new ForbiddenError("Cannot delete this message.");

    await service.from("team_messages")
      .update({ is_deleted: true, content: "" })
      .eq("id", messageId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
