import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";
import { ForbiddenError, ValidationError } from "@/lib/errors";

async function verifyTeamAccess(userId: string, teamId: string, role: string) {
  const service = getSupabaseServiceRoleClient();
  if (role === "student") {
    const { data } = await service.from("team_members")
      .select("id").eq("team_id", teamId).eq("student_id", userId).maybeSingle();
    if (!data) throw new ForbiddenError("You are not a member of this team.");
  } else if (role === "faculty") {
    const { data } = await service.from("team_mentors")
      .select("id").eq("team_id", teamId).eq("mentor_id", userId).maybeSingle();
    if (!data) {
      // Section faculty can also read
      const { data: d2 } = await service.from("teams")
        .select("section_id").eq("id", teamId).single();
      if (d2) {
        const { data: d3 } = await service.from("faculty_assignments")
          .select("id").eq("section_id", d2.section_id).eq("faculty_id", userId).maybeSingle();
        if (!d3) throw new ForbiddenError("You are not assigned to this team.");
      }
    }
  }
}

// GET - fetch messages (paginated, newest last)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const { searchParams } = new URL(request.url);
    const before = searchParams.get("before");
    const after = searchParams.get("after");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    const supabase = await getSupabaseServerClient();
    const { userId, role } = await requireRole(supabase, ["student", "faculty", "admin"]);

    if (role !== "admin") await verifyTeamAccess(userId, teamId, role);

    const service = getSupabaseServiceRoleClient();

    let query = service
      .from("team_messages")
      .select(`
        id, content, is_deleted, edited_at, created_at,
        sender_id,
        reply_to_id,
        profiles!team_messages_sender_id_fkey(full_name),
        team_message_reads(user_id)
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) query = query.lt("created_at", before);
    if (after) query = query.gt("created_at", after);

    const { data, error } = await query;
    if (error) throw error;

    // Return oldest-first for display
    const messages = (data ?? []).reverse().map((m: Record<string, unknown>) => ({
      ...m,
      read_by: ((m.team_message_reads as { user_id: string }[] | null) ?? []).map((r) => r.user_id),
      sender_name: (m.profiles as unknown as { full_name: string } | null)?.full_name ?? "Unknown",
    }));
    return NextResponse.json({ messages });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST - send a message
const sendSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  reply_to_id: z.string().uuid().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const supabase = await getSupabaseServerClient();
    const { userId, role } = await requireRole(supabase, ["student", "faculty"]);

    await verifyTeamAccess(userId, teamId, role);

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed.", parsed.error.flatten().fieldErrors as Record<string, string>);

    const service = getSupabaseServiceRoleClient();

    const { data, error } = await service
      .from("team_messages")
      .insert({
        team_id: teamId,
        sender_id: userId,
        content: parsed.data.content,
        reply_to_id: parsed.data.reply_to_id ?? null,
      })
      .select("id, content, is_deleted, edited_at, created_at, sender_id, reply_to_id, profiles!team_messages_sender_id_fkey(full_name), team_message_reads(user_id)")
      .single();

    if (error) throw error;

    const shaped = {
      ...data,
      read_by: ((data.team_message_reads as { user_id: string }[] | null) ?? []).map((r: { user_id: string }) => r.user_id),
      sender_name: (data.profiles as unknown as { full_name: string } | null)?.full_name ?? "Unknown",
    };

    // Mark as read by sender immediately
    await service.from("team_message_reads").upsert(
      { message_id: data.id, user_id: userId },
      { onConflict: "message_id,user_id" }
    );

    return NextResponse.json({ message: shaped }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
