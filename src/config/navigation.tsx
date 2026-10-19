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
  { label: "Dashboard",          href: "/portal/admin",                     icon: <IconDashboard size={16} /> },
  { label: "Departments",        href: "/portal/admin/departments",          icon: <IconSettings size={16} /> },
  { label: "Academic Years",     href: "/portal/admin/academic-years",      icon: <IconClipboard size={16} /> },
  { label: "Semesters",          href: "/portal/admin/semesters",           icon: <IconClipboard size={16} /> },
  { label: "Sections",           href: "/portal/admin/sections",            icon: <IconClipboard size={16} /> },
  { label: "Faculty Assignments", href: "/portal/admin/faculty-assignments", icon: <IconUsers size={16} /> },
  { label: "Students",           href: "/portal/admin/students",            icon: <IconUsers size={16} /> },
  { label: "Audit Logs",         href: "/portal/admin/audit-logs",          icon: <IconFileText size={16} /> },
  { label: "Notifications",      href: "/portal/admin/notifications",       icon: <IconBell size={16} /> },
];

export const facultyNav: NavItem[] = [
  { label: "Dashboard",          href: "/portal/faculty",                         icon: <IconDashboard size={16} /> },
  { label: "Team Formation Rules", href: "/portal/faculty/team-formation",        icon: <IconUsers size={16} /> },
  { label: "Proposals",          href: "/portal/faculty/proposals",               icon: <IconFileText size={16} /> },
  { label: "Milestones",         href: "/portal/faculty/milestones",              icon: <IconFlag size={16} /> },
  { label: "Submission Windows", href: "/portal/faculty/submission-windows",      icon: <IconUpload size={16} /> },
  { label: "Students",           href: "/portal/faculty/students",                icon: <IconUsers size={16} /> },
  { label: "Notifications",      href: "/portal/faculty/notifications",           icon: <IconBell size={16} /> },
];

export const studentNav: NavItem[] = [
  { label: "Dashboard",    href: "/portal/student",              icon: <IconDashboard size={16} /> },
  { label: "My Team",      href: "/portal/student/teams",        icon: <IconUsers size={16} /> },
  { label: "Proposals",    href: "/portal/student/proposals",    icon: <IconFileText size={16} /> },
  { label: "Milestones",   href: "/portal/student/milestones",   icon: <IconFlag size={16} /> },
  { label: "Submissions",  href: "/portal/student/submissions",  icon: <IconUpload size={16} /> },
  { label: "Profile",      href: "/portal/student/profile",      icon: <IconSettings size={16} /> },
  { label: "Notifications", href: "/portal/student/notifications", icon: <IconBell size={16} /> },
];
