/**
 * Centralized navigation configuration for all portal roles.
 * Import from here instead of defining nav arrays in each page.
 */
import {
  IconDashboard,
  IconSettings,
  IconClipboard,
  IconUsers,
  IconFileText,
  IconBell,
  IconFlag,
  IconUpload,
  IconGitHub,
} from "@/components/ui/Icon";
import type { NavItem } from "@/components/layout/Sidebar";

export const adminNav: NavItem[] = [
  { label: "Dashboard",           href: "/admin",                      icon: <IconDashboard size={16} /> },
  { label: "Departments",         href: "/admin/departments",           icon: <IconSettings size={16} /> },
  { label: "Users",               href: "/admin/users",                 icon: <IconUsers size={16} /> },
  { label: "Faculty Assignments", href: "/admin/faculty-assignments",   icon: <IconUsers size={16} /> },
  { label: "Students",            href: "/admin/students",              icon: <IconUsers size={16} /> },
  { label: "Audit Logs",          href: "/admin/audit-logs",            icon: <IconFileText size={16} /> },
  { label: "Notifications",       href: "/admin/notifications",         icon: <IconBell size={16} /> },
];

export const facultyNav: NavItem[] = [
  { label: "Dashboard",          href: "/faculty",                         icon: <IconDashboard size={16} /> },
  { label: "My Sections",        href: "/faculty/sections",                icon: <IconClipboard size={16} /> },
  { label: "Team Formation Rules", href: "/faculty/team-formation",        icon: <IconUsers size={16} /> },
  { label: "Proposals",          href: "/faculty/proposals",               icon: <IconFileText size={16} /> },
  { label: "Milestones",         href: "/faculty/milestones",              icon: <IconFlag size={16} /> },
  { label: "Submission Windows", href: "/faculty/submission-windows",      icon: <IconUpload size={16} /> },
  { label: "Students",           href: "/faculty/students",                icon: <IconUsers size={16} /> },
  { label: "Notifications",      href: "/faculty/notifications",           icon: <IconBell size={16} /> },
];

export const studentNav: NavItem[] = [
  { label: "Dashboard",    href: "/student",              icon: <IconDashboard size={16} /> },
  { label: "My Team",      href: "/student/teams",        icon: <IconUsers size={16} /> },
  { label: "Proposals",    href: "/student/proposals",    icon: <IconFileText size={16} /> },
  { label: "Milestones",   href: "/student/milestones",   icon: <IconFlag size={16} /> },
  { label: "Submissions",  href: "/student/submissions",  icon: <IconUpload size={16} /> },
  { label: "Profile",      href: "/student/profile",      icon: <IconSettings size={16} /> },
  { label: "Notifications", href: "/student/notifications", icon: <IconBell size={16} /> },
];
