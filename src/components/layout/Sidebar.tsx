"use client";

import { useState } from "react";
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
}

const roleLabel: Record<string, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

export function Sidebar({ navItems, role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex h-full flex-col transition-all duration-200 ${
          collapsed ? "w-0 overflow-hidden md:w-16" : "w-64"
        }`}
        style={{
          backgroundColor: "#1e3a5f",
          minHeight: "100vh",
          flexShrink: 0,
        }}
        aria-label="Main navigation"
      >
        {/* Logo + collapse */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          {!collapsed && (
            <span className="text-lg font-bold text-white">AcadeX</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-white/70 transition-colors hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {collapsed ? (
                <path d="M3 9h12M3 4h12M3 14h12" />
              ) : (
                <path d="M3 9h12M3 4h12M3 14h12" />
              )}
            </svg>
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
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
        <nav className="flex-1 px-2 py-2">
          <ul role="list" className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin" || item.href === "/faculty" || item.href === "/student"
                  ? pathname === item.href          // exact match for dashboard roots
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors"
                    style={{
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.15)"
                        : "transparent",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <span aria-hidden="true" className="flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out */}
        {!collapsed && (
          <div
            className="px-4 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full rounded px-3 py-2 text-left text-sm transition-colors"
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
