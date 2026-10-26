export interface ChatUser {
  id:        string;
  full_name: string;
  role:      "student" | "faculty" | "admin";
}

export interface ChatMessage {
  id:          string;
  team_id:     string;
  sender_id:   string;
  sender_name: string;
  sender_role: string;
  content:     string;
  reply_to_id: string | null;
  reply_to:    { content: string; sender_name: string } | null;
  is_deleted:  boolean;
  edited_at:   string | null;
  created_at:  string;
  read_by:     string[];   // user IDs who have read this message
}

// WebSocket message payloads (client ↔ server)
export type WsClientMessage =
  | { type: "auth";    token: string; teamId: string }
  | { type: "send";    content: string; replyToId?: string }
  | { type: "edit";    messageId: string; content: string }
  | { type: "delete";  messageId: string }
  | { type: "read";    messageId: string }
  | { type: "typing" }
  | { type: "history"; before?: string; limit?: number };

export type WsServerMessage =
  | { type: "auth_ok";   userId: string; teamId: string }
  | { type: "auth_fail"; reason: string }
  | { type: "message";   data: ChatMessage }
  | { type: "edited";    data: ChatMessage }
  | { type: "deleted";   messageId: string }
  | { type: "read";      messageId: string; userId: string }
  | { type: "typing";    userId: string; userName: string }
  | { type: "history";   messages: ChatMessage[]; hasMore: boolean }
  | { type: "online";    userIds: string[] }
  | { type: "error";     message: string };
