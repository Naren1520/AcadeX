import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { ChatRepository } from "./repository";
import type { ChatMessage } from "./types";

function shapeMessage(raw: Record<string, unknown>): ChatMessage {
  const reads = (raw.team_message_reads as { user_id: string }[] | null) ?? [];
  const replyMsg = raw.reply_to_message as { content: string; profiles: { full_name: string } | null } | null;
  return {
    id: String(raw.id),
    team_id: String(raw.team_id),
    sender_id: String(raw.sender_id),
    sender_name: (raw.profiles as { full_name: string } | null)?.full_name ?? "Unknown",
    sender_role: String(raw.sender_role ?? "student"),
    content: raw.is_deleted ? "This message was deleted." : String(raw.content),
    reply_to_id: raw.reply_to_id ? String(raw.reply_to_id) : null,
    reply_to: replyMsg
      ? { content: String(replyMsg.content), sender_name: replyMsg.profiles?.full_name ?? "" }
      : null,
    is_deleted: Boolean(raw.is_deleted),
    edited_at: raw.edited_at ? String(raw.edited_at) : null,
    created_at: String(raw.created_at),
    read_by: reads.map((r) => r.user_id),
  };
}

const SELECT = `
  id, team_id, sender_id, content, is_deleted, edited_at, created_at,
  reply_to_id,
  profiles!team_messages_sender_id_fkey(full_name),
  team_message_reads(user_id),
  reply_to_message:team_messages!reply_to_id(content, profiles!team_messages_sender_id_fkey(full_name))
`;

export class PostgresChatRepository implements ChatRepository {
  private db = getSupabaseServiceRoleClient();

  async getMessages(teamId: string, opts: { before?: string; limit: number }) {
    let q = this.db.from("team_messages")
      .select(SELECT)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(opts.limit);
    if (opts.before) q = q.lt("created_at", opts.before);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as unknown as Record<string, unknown>[])
      .reverse()
      .map(shapeMessage);
  }

  async saveMessage(msg: Omit<ChatMessage, "read_by" | "reply_to">) {
    const { data, error } = await this.db
      .from("team_messages")
      .insert({
        id: msg.id,
        team_id: msg.team_id,
        sender_id: msg.sender_id,
        content: msg.content,
        reply_to_id: msg.reply_to_id,
      })
      .select(SELECT)
      .single();
    if (error) throw error;
    return shapeMessage(data as unknown as Record<string, unknown>);
  }

  async editMessage(messageId: string, senderId: string, content: string) {
    const { data, error } = await this.db
      .from("team_messages")
      .update({ content, edited_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", senderId)
      .eq("is_deleted", false)
      .select(SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return shapeMessage(data as unknown as Record<string, unknown>);
  }

  async deleteMessage(messageId: string, senderId: string) {
    const { error, data } = await this.db
      .from("team_messages")
      .update({ is_deleted: true, content: "" })
      .eq("id", messageId)
      .eq("sender_id", senderId)
      .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  async markRead(messageId: string, userId: string) {
    await this.db.from("team_message_reads")
      .upsert({ message_id: messageId, user_id: userId }, { onConflict: "message_id,user_id" });
  }

  async verifyMember(teamId: string, userId: string, role: string) {
    if (role === "admin") return true;
    if (role === "student") {
      const { data } = await this.db.from("team_members")
        .select("id").eq("team_id", teamId).eq("student_id", userId).maybeSingle();
      return !!data;
    }
    // faculty - mentor or section faculty
    const { data: mentor } = await this.db.from("team_mentors")
      .select("id").eq("team_id", teamId).eq("mentor_id", userId).maybeSingle();
    if (mentor) return true;
    const { data: team } = await this.db.from("teams").select("section_id").eq("id", teamId).single();
    if (!team) return false;
    const { data: asgn } = await this.db.from("faculty_assignments")
      .select("id").eq("section_id", team.section_id).eq("faculty_id", userId).maybeSingle();
    return !!asgn;
  }
}
