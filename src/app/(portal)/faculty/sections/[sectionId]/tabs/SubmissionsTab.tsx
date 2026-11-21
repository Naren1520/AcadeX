"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconCheck, IconFileText, IconGitHub, IconFlag } from "@/components/ui/Icon";
import { EmptyState } from "@/components/feedback/Skeleton";

interface Submission {
  id: string;
  artefact_type: string;
  status: string;
  submitted_at: string;
  storage_path: string | null;
  github_url: string | null;
  milestone_id: string;
  team_id: string;
  teams: { name: string } | null;
  milestones: { name: string } | null;
}

interface Props {
  sectionId: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ppt:         { label: "PPT",    color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe" },
  report:      { label: "Report", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  github_link: { label: "GitHub", color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
};

export function SubmissionsTab({ sectionId }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState<string | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/faculty/sections/${sectionId}/submissions`)
      .then((r) => r.json())
      .then((d: { submissions?: Submission[]; error?: string }) => {
        if (d.error) { setFetchError(d.error); }
        else { setSubmissions(d.submissions ?? []); }
        setLoading(false);
      })
      .catch(() => { setFetchError("Failed to load submissions. Please refresh."); setLoading(false); });
  }, [sectionId]);

  async function viewFile(id: string, label: string) {
    setViewLoading(id); setViewError(null);
    const res = await fetch(`/api/submissions/${id}/url`);
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) { window.open(data.url, "_blank"); }
    else { setViewError(data.error ?? `Could not open ${label}.`); }
    setViewLoading(null);
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-neutral-400">Loading submissions…</div>;
  }

  if (fetchError) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
        {fetchError}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        description="Submissions from student teams will appear here once windows are open and students upload."
      />
    );
  }

  // Group by team
  const byTeam = submissions.reduce<Record<string, Submission[]>>((acc, s) => {
    const key = s.team_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {viewError && (
        <p className="rounded-lg px-3 py-2 text-xs"
          style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          {viewError}
        </p>
      )}

      {Object.entries(byTeam).map(([, teamSubs]) => {
        const teamName = teamSubs[0]?.teams?.name ?? "Unknown Team";
        return (
          <div key={teamSubs[0].team_id} className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #e5e7eb" }}>
            {/* Team header */}
            <div className="flex items-center gap-2 px-5 py-3"
              style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <IconFlag size={13} style={{ color: "#1e3a5f" }} />
              <p className="text-sm font-semibold text-neutral-800">{teamName}</p>
              <span className="ml-auto text-xs text-neutral-400">
                {teamSubs.length} artefact{teamSubs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Submissions list */}
            <div className="divide-y divide-neutral-100">
              {teamSubs.map((s) => {
                const cfg = TYPE_CONFIG[s.artefact_type] ?? { label: s.artefact_type, color: "#374151", bg: "#f9fafb", border: "#e5e7eb" };
                const isGithub = s.artefact_type === "github_link";
                const hasFile  = !!s.storage_path;

                return (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                    {/* Type badge */}
                    <span className="rounded-md px-2 py-0.5 text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>

                    {/* Milestone */}
                    <span className="text-xs text-neutral-400 flex-shrink-0">
                      {s.milestones?.name ?? "—"}
                    </span>

                    {/* GitHub URL inline */}
                    {isGithub && s.github_url && (
                      <a href={s.github_url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 min-w-0 text-xs underline truncate"
                        style={{ color: "#1e3a5f" }}>
                        {s.github_url}
                      </a>
                    )}
                    {!isGithub && (
                      <span className="flex-1 text-xs text-neutral-400">
                        {new Date(s.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}

                    {/* Submitted badge */}
                    <span className="flex items-center gap-1 text-xs font-medium flex-shrink-0"
                      style={{ color: "#16a34a" }}>
                      <IconCheck size={11} /> Submitted
                    </span>

                    {/* View / Open button */}
                    {hasFile && (
                      <button
                        type="button"
                        disabled={viewLoading === s.id}
                        onClick={() => viewFile(s.id, cfg.label)}
                        className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50 flex-shrink-0"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {viewLoading === s.id ? "Loading…" : "View"}
                      </button>
                    )}
                    {isGithub && s.github_url && (
                      <a href={s.github_url} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg px-3 py-1 text-xs font-medium no-underline hover:opacity-80 flex-shrink-0"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        Open →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
