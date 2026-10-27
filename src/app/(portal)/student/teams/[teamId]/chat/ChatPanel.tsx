"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage } from "@/features/team-chat/types";

interface Props {
  teamId: string;
  currentUserId: string;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} ${time}`;
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Read receipt 
function ReadReceipts({ readBy, currentUserId, memberCount }: { readBy: string[] | undefined; currentUserId: string; memberCount: number }) {
  const others = (readBy ?? []).filter((id) => id !== currentUserId);
  if (others.length === 0) return null;
  return (
    <span className="text-xs text-neutral-400">
      Seen by {others.length >= memberCount - 1 ? "all" : others.length}
    </span>
  );
}

// ── Message bubble 
function MessageBubble({ msg, isOwn, onReply, onEdit, onDelete, memberCount, currentUserId }: {
  msg: ChatMessage; isOwn: boolean; memberCount: number; currentUserId: string;
  onReply: (m: ChatMessage) => void;
  onEdit: (m: ChatMessage) => void;
  onDelete: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);

  if (msg.is_deleted) {
    return (
      <div className={`flex mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
        <span className="italic text-xs text-neutral-400 px-3 py-1">Message deleted</span>
      </div>
    );
  }

  return (
    <div className={`group flex gap-2 mb-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {!isOwn && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center self-end rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: "#1e3a5f" }}>
          {msg.sender_name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={`flex flex-col max-w-[72%] sm:max-w-[60%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <p className="mb-0.5 px-1 text-xs font-semibold text-neutral-500">{msg.sender_name}</p>
        )}

        {msg.reply_to && (
          <div className="mb-1 rounded-lg border-l-2 px-2 py-1 text-xs"
            style={{ borderColor: "#1e3a5f", backgroundColor: "#f0f4f8" }}>
            <p className="font-semibold text-neutral-600">{msg.reply_to.sender_name}</p>
            <p className="truncate text-neutral-500">{msg.reply_to.content}</p>
          </div>
        )}

        <div className="rounded-2xl px-4 py-2.5 text-sm shadow-sm"
          style={{
            backgroundColor: isOwn ? "#1e3a5f" : "#ffffff",
            color: isOwn ? "#ffffff" : "#111827",
            border: isOwn ? "none" : "1px solid #e5e7eb",
            borderBottomRightRadius: isOwn ? 4 : undefined,
            borderBottomLeftRadius: isOwn ? undefined : 4,
          }}>
          <p style={{ wordBreak: "break-word" }}>{msg.content}</p>
          {msg.edited_at && <span className="ml-2 text-xs opacity-60">(edited)</span>}
        </div>

        <div className={`mt-0.5 flex items-center gap-2 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-neutral-400">{fmtTime(msg.created_at)}</span>
          {isOwn && <ReadReceipts readBy={msg.read_by ?? []} currentUserId={currentUserId} memberCount={memberCount} />}
        </div>
      </div>

      {hover && (
        <div className={`flex items-center gap-0.5 self-center ${isOwn ? "mr-1" : "ml-1"}`}>
          <Btn title="Reply" onClick={() => onReply(msg)}>↩</Btn>
          {isOwn && <Btn title="Edit" onClick={() => onEdit(msg)}>✎</Btn>}
          {isOwn && <Btn title="Delete" onClick={() => onDelete(msg.id)} danger>✕</Btn>}
        </div>
      )}
    </div>
  );
}

function Btn({ title, onClick, children, danger }: { title: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs transition-colors hover:bg-neutral-200"
      style={{ color: danger ? "#dc2626" : "#6b7280" }}>
      {children}
    </button>
  );
}

function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1" style={{ borderTop: "1px solid #e5e7eb" }} />
      <span className="bg-white px-2 text-xs text-neutral-400">{label}</span>
      <div className="flex-1" style={{ borderTop: "1px solid #e5e7eb" }} />
    </div>
  );
}

// ── Main ─
export function ChatPanel({ teamId, currentUserId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [memberCount, setMemberCount] = useState(2);
  const [hasMore, setHasMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const latestRef = useRef<string | undefined>(undefined);

  const fetchMessages = useCallback(async (opts?: { before?: string; after?: string; initial?: boolean }) => {
    const params = new URLSearchParams({ limit: "50" });
    if (opts?.before) params.set("before", opts.before);
    if (opts?.after) params.set("after", opts.after);
    const res = await fetch(`/api/teams/${teamId}/messages?${params}`);
    if (!res.ok) { setError("Failed to load messages."); return; }
    const d = await res.json() as { messages: ChatMessage[] };
    const msgs = d.messages ?? [];

    if (opts?.initial) {
      setMessages(msgs);
      setHasMore(msgs.length === 50);
      setLoaded(true);
      if (msgs.length > 0) {
        latestRef.current = msgs[msgs.length - 1].created_at;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 30);
      }
    } else if (opts?.before) {
      setMessages((prev) => [...msgs, ...prev]);
      setHasMore(msgs.length === 50);
    } else if (opts?.after && msgs.length > 0) {
      latestRef.current = msgs[msgs.length - 1].created_at;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const news = msgs.filter((m) => !ids.has(m.id));
        if (!news.length) return prev;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
        return [...prev, ...news];
      });
    }
  }, [teamId]);

  // Initial load
  useEffect(() => {
    fetchMessages({ initial: true });
  }, [fetchMessages]);

  // Poll every 3s for new messages
  useEffect(() => {
    if (!loaded) return;
    pollRef.current = setInterval(() => {
      if (document.hidden) return;
      fetchMessages({ after: latestRef.current });
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loaded, fetchMessages]);

  // Mark messages as read
  useEffect(() => {
    messages.forEach((m) => {
      if (m.sender_id !== currentUserId && !m.read_by.includes(currentUserId)) {
        fetch(`/api/teams/${teamId}/messages/${m.id}/read`, { method: "POST" }).catch(() => { });
      }
    });
  }, [messages, currentUserId, teamId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setSending(true); setError(null);

    if (editingMsg) {
      const res = await fetch(`/api/teams/${teamId}/messages/${editingMsg.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await res.json() as { message?: ChatMessage; error?: string };
      if (!res.ok) { setError(d.error ?? "Failed to edit."); }
      else { setMessages((prev) => prev.map((m) => m.id === editingMsg.id ? d.message! : m)); }
      setEditingMsg(null);
    } else {
      const res = await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, reply_to_id: replyTo?.id }),
      });
      const d = await res.json() as { message?: ChatMessage; error?: string };
      if (!res.ok) { setError(d.error ?? "Failed to send."); }
      else if (d.message) {
        latestRef.current = d.message.created_at;
        setMessages((prev) => [...prev, d.message!]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
      }
      setReplyTo(null);
    }
    setInput(""); setSending(false);
    inputRef.current?.focus();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/teams/${teamId}/messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_deleted: true, content: "" } : m));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent); }
    if (e.key === "Escape") { setReplyTo(null); setEditingMsg(null); setInput(""); }
  }

  function startEdit(msg: ChatMessage) {
    setEditingMsg(msg); setReplyTo(null); setInput(msg.content);
    inputRef.current?.focus();
  }

  const filtered = search
    ? messages.filter((m) => !m.is_deleted && m.content.toLowerCase().includes(search.toLowerCase()))
    : messages;

  const byDay: { label: string; msgs: ChatMessage[] }[] = [];
  let lastDay = "";
  for (const m of filtered) {
    const day = fmtDay(m.created_at);
    if (day !== lastDay) { byDay.push({ label: day, msgs: [] }); lastDay = day; }
    byDay[byDay.length - 1].msgs.push(m);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl"
      style={{ border: "1px solid #e5e7eb", height: "calc(100dvh - 220px)", minHeight: 420, backgroundColor: "#f9fafb" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#1e3a5f", borderBottom: "1px solid #1a3356" }}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-semibold text-white">Group Chat</span>
        </div>
        <button type="button" onClick={() => setShowSearch((p) => !p)}
          className="cursor-pointer rounded p-1.5 text-white/70 hover:text-white" title="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {showSearch && (
        <div className="px-4 py-2" style={{ backgroundColor: "#f0f4f8", borderBottom: "1px solid #e5e7eb" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…" autoFocus
            className="w-full rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }} />
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!loaded && (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          </div>
        )}

        {loaded && hasMore && (
          <div className="flex justify-center pb-3">
            <button type="button" onClick={() => messages.length > 0 && fetchMessages({ before: messages[0].created_at })}
              className="cursor-pointer rounded-full px-3 py-1 text-xs"
              style={{ backgroundColor: "#e5e7eb", color: "#374151" }}>
              Load older messages
            </button>
          </div>
        )}

        {loaded && filtered.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-neutral-400">
              {search ? "No messages match your search." : "No messages yet. Say hello!"}
            </p>
          </div>
        )}

        {byDay.map((group) => (
          <div key={group.label}>
            <DateSep label={group.label} />
            {group.msgs.map((m) => (
              <MessageBubble key={m.id} msg={m} currentUserId={currentUserId}
                isOwn={m.sender_id === currentUserId} memberCount={memberCount}
                onReply={(msg) => { setReplyTo(msg); setEditingMsg(null); setInput(""); inputRef.current?.focus(); }}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply / Edit banner */}
      {(replyTo || editingMsg) && (
        <div className="flex items-center justify-between px-4 py-2"
          style={{ backgroundColor: "#eff6ff", borderTop: "1px solid #bfdbfe" }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "#1e3a5f" }}>
              {editingMsg ? "Editing message" : `Replying to ${replyTo?.sender_name}`}
            </p>
            <p className="truncate text-xs text-neutral-500">{editingMsg?.content ?? replyTo?.content}</p>
          </div>
          <button type="button" onClick={() => { setReplyTo(null); setEditingMsg(null); setInput(""); }}
            className="ml-2 cursor-pointer text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend}
        className="flex items-end gap-2 px-4 py-3"
        style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        <textarea ref={inputRef} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          style={{ border: "1px solid #d1d5db", backgroundColor: "#f9fafb", maxHeight: 120, overflowY: "auto" }}
        />
        <button type="submit" disabled={sending || !input.trim()}
          className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: "#1e3a5f" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
