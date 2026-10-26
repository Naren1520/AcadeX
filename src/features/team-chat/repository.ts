import type { ChatMessage } from "./types";

/**
 * Abstract repository interface.
 * Swap the implementation (postgres-repository.ts) for any other DB
 * without touching the WebSocket server or UI.
 */
export interface ChatRepository {
  getMessages(teamId: string, opts: { before?: string; limit: number }): Promise<ChatMessage[]>;
  saveMessage(msg: Omit<ChatMessage, "read_by" | "reply_to">): Promise<ChatMessage>;
  editMessage(messageId: string, senderId: string, content: string): Promise<ChatMessage | null>;
  deleteMessage(messageId: string, senderId: string): Promise<boolean>;
  markRead(messageId: string, userId: string): Promise<void>;
  verifyMember(teamId: string, userId: string, role: string): Promise<boolean>;
}
