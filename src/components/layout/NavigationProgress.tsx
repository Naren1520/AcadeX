"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRoute = useRef(`${pathname}${searchParams}`);

  function startProgress() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    setProgress(0);
    setVisible(true);

    let p = 0;
    tickRef.current = setInterval(() => {
      // Advances quickly to 30%, slows exponentially toward 90%
      p += p < 30 ? 8 : p < 60 ? 4 : p < 80 ? 1.5 : p < 90 ? 0.5 : 0;
      setProgress(Math.min(p, 90));
    }, 80);
  }

  function completeProgress() {
    if (tickRef.current) clearInterval(tickRef.current);
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }

  // Detect route change completion
  useEffect(() => {
    const current = `${pathname}${searchParams}`;
    if (current !== prevRoute.current) {
      prevRoute.current = current;
      completeProgress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Listen for navigation start via click on internal links
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only internal relative links or same-origin absolute links
      const isInternal =
        href.startsWith("/") ||
        (href.startsWith(window.location.origin) && !href.startsWith("//"));

      // Skip links with download, target, or hash-only
      if (!isInternal) return;
      if (target.hasAttribute("download")) return;
      if (target.getAttribute("target") === "_blank") return;
      if (href.startsWith("#")) return;

      // Don't re-trigger if clicking the current page
      const destination = href.startsWith("/") ? href : new URL(href).pathname;
      if (destination === pathname && !href.includes("?")) return;

      startProgress();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Also trigger on form submissions (e.g. sign out)
  useEffect(() => {
    function handleSubmit() { startProgress(); }
    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#1e3a5f",
          transition: progress === 100
            ? "width 0.15s ease-out"
            : "width 0.08s linear",
          boxShadow: "0 0 8px rgba(30,58,95,0.5)",
        }}
      />
    </div>
  );
}
