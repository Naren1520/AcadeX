"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/Skeleton";
import { IconArrowRight } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/dates";
import Link from "next/link";

interface Notification {
  id: string;
  message: string;
  deep_link: string;
  trigger_event: string;
  is_read: boolean;
  created_at: string;
}

interface Props { initialNotifications: Notification[] }

export function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">{unreadCount} unread</p>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className="flex items-start justify-between gap-4 rounded p-4"
              style={{
                border: "1px solid #e5e7eb",
                backgroundColor: notif.is_read ? "#ffffff" : "#f0f7ff",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {!notif.is_read && (
                    <span
                      className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: "#1e3a5f" }}
                      aria-label="Unread"
                    />
                  )}
                  <p className="text-sm text-neutral-900">{notif.message}</p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-neutral-400">{formatDateTime(notif.created_at)}</span>
                  <Badge variant="neutral">{notif.trigger_event.replace(/\./g, " ")}</Badge>
                  <Link href={notif.deep_link} className="inline-flex items-center gap-1 text-xs" style={{ color: "#1e3a5f" }}>
                    View
                    <IconArrowRight size={12} />
                  </Link>
                </div>
              </div>
              {!notif.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(notif.id)}>
                  Mark read
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
