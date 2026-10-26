"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { IconUsers, IconFileText, IconFlag, IconUpload } from "@/components/ui/Icon";
import type { MenteeTeamCard } from "./page";

export function MenteeTeamsClient({ cards }: { cards: MenteeTeamCard[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => {
        const status = c.team_status as "forming" | "confirmed" | "dissolved";
        return (
          <button
            key={c.team_id}
            type="button"
            onClick={() => router.push(`/faculty/mentee/${c.team_id}`)}
            className="cursor-pointer rounded-2xl text-left transition-all hover:shadow-lg"
            style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff", overflow: "hidden" }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#f5f3ff", borderBottom: "1px solid #e5e7eb" }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xl font-bold" style={{ color: "#7c3aed" }}>{c.team_name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{c.dept_name} · Section {c.section_label}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">Assigned by {c.assigned_by}</p>
                </div>
                <Badge variant={status}>{status}</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "#f3f4f6" }}>
              {[
                { icon: <IconUsers size={13} />,     label: "Students",    value: c.student_count,   color: "#16a34a", bg: "#f0fdf4" },
                { icon: <IconFileText size={13} />,  label: "Proposals",   value: c.proposal_count,  color: "#1e3a5f", bg: "#eff6ff" },
                { icon: <IconFlag size={13} />,      label: "Milestones",  value: c.milestone_count, color: "#7c3aed", bg: "#f5f3ff" },
                { icon: <IconUpload size={13} />,    label: "Submissions", value: c.submission_count, color: "#0369a1", bg: "#f0f9ff" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-3"
                  style={{ backgroundColor: "#ffffff" }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <p className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-neutral-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3">
              {c.open_milestones > 0 ? (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#7c3aed" }}>
                  <IconFlag size={12} /> {c.open_milestones} open milestone{c.open_milestones !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs text-neutral-400">All milestones done</span>
              )}
              <span className="text-xs text-neutral-400">View dashboard →</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
