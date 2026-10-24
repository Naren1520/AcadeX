"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { IconUsers, IconFileText, IconFlag, IconClipboard } from "@/components/ui/Icon";
import type { SectionCard } from "./page";

export function SectionListClient({ cards }: { cards: SectionCard[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <button
          key={c.section_id}
          type="button"
          onClick={() => router.push(`/faculty/sections/${c.section_id}`)}
          className="cursor-pointer rounded-2xl p-0 text-left transition-all hover:shadow-lg"
          style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff", overflow: "hidden" }}
        >
          {/* Card header */}
          <div className="px-5 pt-5 pb-4" style={{ backgroundColor: "#f0f9ff", borderBottom: "1px solid #e5e7eb" }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xl font-bold" style={{ color: "#1e3a5f" }}>{c.section_label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{c.dept_name} ({c.dept_code})</p>
              </div>
              <Badge variant={c.can_manage_students ? "approved" : "neutral"}>
                {c.can_manage_students ? "Can add students" : "View only"}
              </Badge>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "#f3f4f6" }}>
            {[
              { icon: <IconUsers size={14} />,    label: "Students",  value: c.student_count,     color: "#16a34a",  bg: "#f0fdf4" },
              { icon: <IconUsers size={14} />,    label: "Teams",     value: c.team_count,         color: "#1e3a5f",  bg: "#eff6ff" },
              { icon: <IconFileText size={14} />, label: "Pending",   value: c.pending_proposals,  color: "#d97706",  bg: "#fffbeb" },
              { icon: <IconFlag size={14} />,     label: "Milestones", value: c.open_milestones,   color: "#7c3aed",  bg: "#f5f3ff" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-4 py-3"
                style={{ backgroundColor: "#ffffff" }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-neutral-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: "#1e3a5f" }}>
              <IconClipboard size={12} /> Manage section
            </span>
            <span className="text-xs text-neutral-400">→</span>
          </div>
        </button>
      ))}
    </div>
  );
}
 