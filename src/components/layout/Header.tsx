import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  userFullName?: string;
  role?: "admin" | "faculty" | "student";
  unreadCount?: number;
  onMenuToggle?: () => void;
}

const roleVariant = {
  admin: "neutral",
  faculty: "forming",
  student: "neutral",
} as const;

export function Header({
  breadcrumbs = [],
  userFullName,
  role,
  unreadCount = 0,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header
      className="flex h-14 items-center justify-between gap-2 px-3 sm:px-6"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Hamburger - mobile only */}
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="cursor-pointer rounded p-1.5 text-neutral-500 transition-colors hover:text-neutral-900 md:hidden"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        )}

        {/* Breadcrumbs - hide on very small screens, show from sm */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1 text-sm" role="list">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className={`flex items-center gap-1 ${i < breadcrumbs.length - 1 ? "hidden sm:flex" : "flex min-w-0"}`}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-neutral-400">/</span>
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="truncate text-neutral-500 hover:text-neutral-900">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-neutral-900" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        {role && (
          <Link
            href={`/${role}/notifications`}
            className="relative cursor-pointer rounded p-1.5 text-neutral-500 transition-colors hover:text-neutral-900"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: "#dc2626" }}
                aria-hidden="true"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* User info */}
        {userFullName && role && (
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#1e3a5f" }}
              aria-hidden="true"
            >
              {userFullName.charAt(0).toUpperCase()}
            </div>
            {/* Name + role - hide on mobile */}
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-medium leading-none text-neutral-900">{userFullName}</span>
              <Badge variant={roleVariant[role]} className="mt-0.5 self-start">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
