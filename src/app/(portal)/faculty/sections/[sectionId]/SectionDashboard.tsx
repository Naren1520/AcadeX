"use client";

import { useState } from "react";
import { IconUsers, IconFileText, IconFlag, IconUpload, IconClipboard, IconSettings } from "@/components/ui/Icon";
import { StudentsTab }          from "./tabs/StudentsTab";
import { TeamRulesTab }         from "./tabs/TeamRulesTab";
import { ProposalsTab }         from "./tabs/ProposalsTab";
import { MilestonesTab }        from "./tabs/MilestonesTab";
import { SubmissionWindowsTab } from "./tabs/SubmissionWindowsTab";
import { OnboardingTab }        from "./tabs/OnboardingTab";
import type { Student, Rule, Proposal, Milestone, SubmissionWindow } from "./page";

type Tab = "overview" | "students" | "rules" | "proposals" | "milestones" | "windows" | "onboarding";

interface Props {
  sectionId: string;
  sectionLabel: string;
  deptCode: string;
  deptName: string;
  departmentId: string;
  canManageStudents: boolean;
  stats: { students: number; teams: number; pendingProposals: number; openMilestones: number };
  initialStudents: Student[];
  initialRules: Rule[];
  initialProposals: Proposal[];
  initialMilestones: Milestone[];
  initialWindows: SubmissionWindow[];
  approvedProposals: { id: string; title: string }[];
  openMilestones: { id: string; name: string }[];
  initialInvitations: { id: string; label: string; opens_at: string; closes_at: string; max_uses: number; use_count: number; is_active: boolean; created_at: string }[];
  initialOnboardingSubmissions: { id: string; full_name: string; email: string; usn: string; cgpa: number; github_url: string | null; skills: string[]; status: "pending" | "approved" | "rejected"; submitted_at: string; rejection_note: string | null }[];
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",           icon: <IconClipboard size={14} /> },
  { id: "students",   label: "Students",           icon: <IconUsers size={14} /> },
  { id: "rules",      label: "Team Rules",         icon: <IconSettings size={14} /> },
  { id: "proposals",  label: "Proposals",          icon: <IconFileText size={14} /> },
  { id: "milestones", label: "Milestones",         icon: <IconFlag size={14} /> },
  { id: "windows",    label: "Submission Windows", icon: <IconUpload size={14} /> },
  { id: "onboarding", label: "Onboarding",         icon: <IconUsers size={14} /> },
];

export function SectionDashboard({
  sectionId, sectionLabel, deptCode, deptName, departmentId, canManageStudents,
  stats, initialStudents, initialRules, initialProposals,
  initialMilestones, initialWindows, approvedProposals, openMilestones,
  initialInvitations, initialOnboardingSubmissions,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [students, setStudents]   = useState(initialStudents);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Students",          value: students.length,              color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Teams",             value: stats.teams,                  color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "Pending Proposals", value: stats.pendingProposals,       color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
          { label: "Open Milestones",   value: stats.openMilestones,         color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-5 py-4 text-center"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-xl p-1" style={{ backgroundColor: "#f3f4f6" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            // Badge for pending proposals
            const badge = tab.id === "proposals" && stats.pendingProposals > 0
              ? stats.pendingProposals
              : tab.id === "milestones" && stats.openMilestones > 0
              ? stats.openMilestones
              : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "#ffffff" : "transparent",
                  color:           active ? "#1e3a5f" : "#6b7280",
                  boxShadow:       active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab.icon}
                {tab.label}
                {badge && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#dc2626" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            sectionLabel={sectionLabel} deptCode={deptCode} deptName={deptName}
            stats={{ ...stats, students: students.length }}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "students" && (
          <StudentsTab
            sectionId={sectionId} sectionLabel={sectionLabel}
            deptCode={deptCode} canManage={canManageStudents}
            students={students} setStudents={setStudents}
          />
        )}
        {activeTab === "rules" && (
          <TeamRulesTab sectionId={sectionId} initialRules={initialRules} />
        )}
        {activeTab === "proposals" && (
          <ProposalsTab initialProposals={initialProposals} />
        )}
        {activeTab === "milestones" && (
          <MilestonesTab
            initialMilestones={initialMilestones}
            approvedProposals={approvedProposals}
          />
        )}
        {activeTab === "windows" && (
          <SubmissionWindowsTab
            initialWindows={initialWindows}
            openMilestones={openMilestones}
          />
        )}
        {activeTab === "onboarding" && (
          <OnboardingTab
            sectionId={sectionId}
            sectionLabel={sectionLabel}
            departmentId={departmentId}
            initialInvitations={initialInvitations}
            initialSubmissions={initialOnboardingSubmissions}
          />
        )}
      </div>
    </div>
  );
}

// ── Overview tab 
function OverviewTab({
  sectionLabel, deptCode, deptName, stats,
  onNavigate,
}: {
  sectionLabel: string; deptCode: string; deptName: string;
  stats: { students: number; teams: number; pendingProposals: number; openMilestones: number };
  onNavigate: (tab: Tab) => void;
}) {
  const shortcuts: { tab: Tab; title: string; description: string; color: string; bg: string; icon: React.ReactNode }[] = [
    { tab: "students",   title: "Students",           description: `${stats.students} enrolled`,         color: "#16a34a", bg: "#f0fdf4", icon: <IconUsers size={20} /> },
    { tab: "rules",      title: "Team Rules",         description: "Configure CGPA-based rules",         color: "#1e3a5f", bg: "#eff6ff", icon: <IconSettings size={20} /> },
    { tab: "proposals",  title: "Proposals",          description: `${stats.pendingProposals} pending`,  color: "#d97706", bg: "#fffbeb", icon: <IconFileText size={20} /> },
    { tab: "milestones", title: "Milestones",         description: `${stats.openMilestones} open`,       color: "#7c3aed", bg: "#f5f3ff", icon: <IconFlag size={20} /> },
    { tab: "windows",    title: "Submission Windows", description: "Control upload periods",             color: "#0369a1", bg: "#f0f9ff", icon: <IconUpload size={20} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-5" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <p className="text-sm text-neutral-600">
          You are managing section <strong>{sectionLabel}</strong> of the <strong>{deptName} ({deptCode})</strong> department.
          Use the tabs above or the shortcuts below to navigate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <button
            key={s.tab}
            type="button"
            onClick={() => onNavigate(s.tab)}
            className="cursor-pointer rounded-xl p-5 text-left transition-all hover:shadow-md"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.color}22` }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${s.color}22`, color: s.color }}>
              {s.icon}
            </div>
            <p className="font-semibold text-neutral-800">{s.title}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{s.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
