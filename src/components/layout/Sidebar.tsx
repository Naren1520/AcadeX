"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  role: "admin" | "faculty" | "student";
  /** controlled from Header hamburger on mobile */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const roleLabel: Record<string, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

export function Sidebar({ navItems, role, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "flex flex-col transition-all duration-200",
          // Mobile: fixed drawer that slides in/out
          "fixed inset-y-0 left-0 z-40 md:relative md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop width
          desktopCollapsed ? "md:w-16" : "md:w-64",
          // Mobile always full sidebar width when open
          "w-64",
        ].join(" ")}
        style={{ backgroundColor: "#1e3a5f", minHeight: "100dvh", flexShrink: 0 }}
        aria-label="Main navigation"
      >
        {/* Logo + collapse toggle */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          {!desktopCollapsed && (
            <span className="text-lg font-bold text-white">AcadeX</span>
          )}
          {/* Desktop collapse button */}
          <button
            onClick={() => setDesktopCollapsed((c) => !c)}
            className="hidden cursor-pointer rounded p-1 text-white/70 transition-colors hover:text-white md:block"
            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M3 9h12M3 4h12M3 14h12" />
            </svg>
          </button>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="cursor-pointer rounded p-1 text-white/70 transition-colors hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>

        {/* Role badge */}
        {!desktopCollapsed && (
          <div className="px-4 py-2">
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
            >
              {roleLabel[role]}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul role="list" className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin" || item.href === "/faculty" || item.href === "/student"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors"
                    style={{
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                      backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <span aria-hidden="true" className="flex-shrink-0">{item.icon}</span>
                    )}
                    {!desktopCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out */}
        {!desktopCollapsed && (
          <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full cursor-pointer rounded px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}
