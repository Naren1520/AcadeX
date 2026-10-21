import { Shell } from "./Shell";
import { SkeletonTable } from "@/components/feedback/Skeleton";
import { Skeleton } from "@/components/feedback/Skeleton";
import { adminNav, facultyNav, studentNav } from "@/config/navigation";
import type { NavItem } from "./Sidebar";

interface LoadingShellProps {
  role: "admin" | "faculty" | "student";
  rows?: number;
  cols?: number;
}

const navMap: Record<string, NavItem[]> = {
  admin:   adminNav,
  faculty: facultyNav,
  student: studentNav,
};

export function LoadingShell({ role, rows = 6, cols = 4 }: LoadingShellProps) {
  return (
    <Shell role={role} navItems={navMap[role]}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>
        {/* Table skeleton */}
        <SkeletonTable rows={rows} cols={cols} />
      </div>
    </Shell>
  );
}
