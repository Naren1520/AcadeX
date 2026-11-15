"use client";

import { useState } from "react";
import { IconCheck, IconInfo, IconAlertTriangle, IconArrowRight } from "@/components/ui/Icon";

export interface GuideSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export function GuideShell({ sections }: { sections: GuideSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="lg:hidden">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ border: "1px solid #d1d5db", backgroundColor: "#fff" }}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <aside className="hidden w-52 flex-shrink-0 lg:block" style={{ position: "sticky", top: "1.5rem", alignSelf: "flex-start" }}>
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb" }}>
          <nav className="flex flex-col">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  backgroundColor: active === s.id ? "#eff6ff" : "#fff",
                  color: active === s.id ? "#1e3a5f" : "#374151",
                  fontWeight: active === s.id ? "600" : "400",
                  borderLeft: active === s.id ? "3px solid #1e3a5f" : "3px solid transparent",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {s.icon && <span style={{ opacity: 0.7 }}>{s.icon}</span>}
                {s.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {sections.map((s) =>
          s.id === active ? (
            <div key={s.id} className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{s.title}</h2>
                <div className="mt-1.5 h-1 w-12 rounded" style={{ backgroundColor: "#1e3a5f" }} />
              </div>
              {s.content}
            </div>
          ) : null
        )}
      </main>
    </div>
  );
}

export function StepList({ steps }: { steps: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#1e3a5f" }}>
            {i + 1}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="mb-1 font-semibold text-neutral-900">{s.title}</p>
            <div className="text-sm text-neutral-600">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function InfoBox({ type, children }: { type: "note" | "warning" | "tip"; children: React.ReactNode }) {
  const config = {
    note:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a5f", icon: <IconInfo size={14} /> },
    warning: { bg: "#fef3c7", border: "#fde68a", color: "#92400e", icon: <IconAlertTriangle size={14} /> },
    tip:     { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: <IconCheck size={14} /> },
  }[type];
  return (
    <div className="flex gap-3 rounded-lg px-4 py-3"
      style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: config.color }}>{config.icon}</span>
      <p className="text-sm" style={{ color: config.color }}>{children}</p>
    </div>
  );
}

export function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: i === steps.length - 1 ? "#16a34a" : "#1e3a5f" }}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <IconArrowRight size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function RuleTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #e5e7eb" }}>
      <table className="w-full text-sm">
        <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-xs text-neutral-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-neutral-800">{children}</h3>;
}

export function StatusPill({ label, variant }: {
  label: string;
  variant: "pending" | "approved" | "rejected" | "revision" | "forming" | "confirmed" | "dissolved" | "neutral";
}) {
  const styles: Record<string, React.CSSProperties> = {
    pending:   { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    approved:  { backgroundColor: "#dcfce7", color: "#14532d", border: "1px solid #bbf7d0" },
    rejected:  { backgroundColor: "#fee2e2", color: "#7f1d1d", border: "1px solid #fecaca" },
    revision:  { backgroundColor: "#ffedd5", color: "#7c2d12", border: "1px solid #fed7aa" },
    forming:   { backgroundColor: "#dbeafe", color: "#1e3a8a", border: "1px solid #bfdbfe" },
    confirmed: { backgroundColor: "#dcfce7", color: "#14532d", border: "1px solid #bbf7d0" },
    dissolved: { backgroundColor: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" },
    neutral:   { backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
  };
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium" style={styles[variant]}>
      {label}
    </span>
  );
}

// Vertical timeline — each node has a label, sublabel, icon color, and optional description
export interface TimelineNode {
  label: string;
  sublabel?: string;
  description?: string;
  color: string;
  bg: string;
  icon?: React.ReactNode;
}

export function VerticalTimeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="relative flex flex-col gap-0">
      {nodes.map((n, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          {i < nodes.length - 1 && (
            <div className="absolute left-4 top-9 bottom-0 w-px" style={{ backgroundColor: "#e5e7eb" }} />
          )}
          <div
            className="relative z-10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: n.color }}
          >
            {n.icon ?? <span>{i + 1}</span>}
          </div>
          <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: n.bg, border: `1px solid ${n.color}30` }}>
            <p className="font-semibold text-sm" style={{ color: n.color }}>{n.label}</p>
            {n.sublabel && <p className="text-xs text-neutral-500 mt-0.5">{n.sublabel}</p>}
            {n.description && <p className="text-xs text-neutral-600 mt-1">{n.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Hierarchy tree — renders a parent with children and grandchildren
export interface HierarchyNode {
  label: string;
  example?: string;
  color: string;
  bg: string;
  children?: HierarchyNode[];
}

export function HierarchyTree({ root }: { root: HierarchyNode }) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0 min-w-max">
        <HierarchyNode node={root} depth={0} isLast={true} />
      </div>
    </div>
  );
}

function HierarchyNode({ node, depth }: { node: HierarchyNode; depth: number; isLast?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
        {depth > 0 && (
          <div className="flex items-center gap-0 flex-shrink-0">
            <div className="w-4 h-px" style={{ backgroundColor: "#d1d5db" }} />
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 my-1"
          style={{ backgroundColor: node.bg, border: `1px solid ${node.color}44`, minWidth: 120 }}>
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: node.color }} />
          <span className="text-xs font-semibold" style={{ color: node.color }}>{node.label}</span>
          {node.example && <span className="text-xs text-neutral-400">— {node.example}</span>}
        </div>
      </div>
      {node.children?.map((child, i) => (
        <div key={i} className="flex" style={{ paddingLeft: depth * 24 }}>
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 + (depth > 0 ? 24 : 0) }}>
            <div className="w-px flex-1" style={{ backgroundColor: "#d1d5db", minHeight: 8 }} />
          </div>
          <div className="flex-1">
            <HierarchyNode node={child} depth={depth + 1} isLast={i === (node.children!.length - 1)} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Role permission matrix — columns are roles, rows are features
export interface PermissionMatrixProps {
  features: string[];
  roles: { label: string; color: string }[];
  matrix: boolean[][];
}

export function PermissionMatrix({ features, roles, matrix }: PermissionMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #e5e7eb" }}>
      <table className="w-full text-sm">
        <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 w-48">Feature</th>
            {roles.map((r) => (
              <th key={r.label} className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ color: r.color }}>
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, fi) => (
            <tr key={fi} style={{ backgroundColor: fi % 2 === 0 ? "#fff" : "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
              <td className="px-4 py-2.5 text-xs font-medium text-neutral-700">{feature}</td>
              {roles.map((_, ri) => (
                <td key={ri} className="px-4 py-2.5 text-center">
                  {matrix[fi][ri] ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full mx-auto"
                      style={{ backgroundColor: "#dcfce7" }}>
                      <IconCheck size={11} style={{ color: "#16a34a" }} />
                    </span>
                  ) : (
                    <span className="inline-block h-1.5 w-4 rounded-full mx-auto"
                      style={{ backgroundColor: "#e5e7eb" }} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Labelled flow — like FlowDiagram but each step can have a sub-label below it
export interface LabelledFlowStep {
  label: string;
  sublabel?: string;
  color?: string;
}

export function LabelledFlow({ steps }: { steps: LabelledFlowStep[] }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white text-center"
              style={{ backgroundColor: s.color ?? (i === steps.length - 1 ? "#16a34a" : "#1e3a5f") }}>
              {s.label}
            </span>
            {s.sublabel && (
              <span className="text-center text-xs text-neutral-400 max-w-20">{s.sublabel}</span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className="mt-1.5 flex-shrink-0">
              <IconArrowRight size={12} style={{ color: "#9ca3af" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
