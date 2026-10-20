"use client";

import { useState } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
  role: "admin" | "faculty" | "student";
  navItems: NavItem[];
  breadcrumbs?: { label: string; href?: string }[];
  userFullName?: string;
  unreadCount?: number;
}

export function Shell({
  children,
  role,
  navItems,
  breadcrumbs,
  userFullName,
  unreadCount,
}: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden" style={{ backgroundColor: "#f9fafb" }}>
      <Sidebar
        navItems={navItems}
        role={role}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          breadcrumbs={breadcrumbs}
          userFullName={userFullName}
          role={role}
          unreadCount={unreadCount}
          onMenuToggle={() => setMobileMenuOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
