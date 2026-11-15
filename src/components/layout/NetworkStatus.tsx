"use client";

import { useEffect, useRef, useState } from "react";

type Status = "online" | "offline" | "slow";

const SLOW_THRESHOLD_MS = 3000;
const PROBE_URL = "/favicon.ico";
const PROBE_INTERVAL_MS = 20_000;

function measureLatency(): Promise<number> {
  return new Promise((resolve) => {
    const start = Date.now();
    const img = new Image();
    const timeout = setTimeout(() => resolve(SLOW_THRESHOLD_MS + 1), SLOW_THRESHOLD_MS + 500);
    img.onload = img.onerror = () => {
      clearTimeout(timeout);
      resolve(Date.now() - start);
    };
    img.src = `${PROBE_URL}?_=${Date.now()}`;
  });
}

const CONFIG: Record<Status, { bg: string; border: string; color: string; text: string }> = {
  offline: {
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#dc2626",
    text: "No internet connection — changes may not be saved.",
  },
  slow: {
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#d97706",
    text: "Slow connection detected — the page may load slowly.",
  },
  online: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#16a34a",
    text: "Connection restored.",
  },
};

export function NetworkStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const probeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function show(s: Status) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setStatus(s);
    setVisible(true);
    if (s === "online") {
      hideTimer.current = setTimeout(() => setVisible(false), 3000);
    }
  }

  useEffect(() => {
    function handleOffline() { show("offline"); }
    function handleOnline()  { show("online"); }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);

    async function probe() {
      if (!navigator.onLine) return;
      const ms = await measureLatency();
      if (!navigator.onLine) return;
      if (ms > SLOW_THRESHOLD_MS) {
        show("slow");
      } else if (status === "slow") {
        show("online");
      }
    }

    probeTimer.current = setInterval(probe, PROBE_INTERVAL_MS);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
      if (probeTimer.current) clearInterval(probeTimer.current);
      if (hideTimer.current)  clearTimeout(hideTimer.current);
    };
  }, [status]);

  if (!visible || !status) return null;

  const c = CONFIG[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 px-4 py-2 text-xs font-medium"
      style={{
        backgroundColor: c.bg,
        borderBottom: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: c.color }}
        />
        {c.text}
      </div>
      {status !== "online" && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex-shrink-0 opacity-60 hover:opacity-100"
          aria-label="Dismiss"
          style={{ color: c.color }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
