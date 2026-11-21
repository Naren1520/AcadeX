"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/forms/FormError";
import { EmptyState } from "@/components/feedback/Skeleton";
import { IconCheck, IconUpload, IconAlertCircle, IconFileText, IconGitHub } from "@/components/ui/Icon";
import { isWindowOpen, formatDateTime } from "@/lib/dates";

interface Props {
  teamId: string | null;
  milestones: Record<string, unknown>[];
  windows: Record<string, unknown>[];
  existingSubmissions: Record<string, unknown>[];
}

const ACCEPT = { ppt: ".pptx,.ppt", report: ".pdf" } as const;
const HINT   = { ppt: "PPTX or PPT", report: "PDF only" } as const;

function FileUploadZone({
  type, existing, open, uploading, error, success, onUpload,
}: {
  type: "ppt" | "report";
  existing: Record<string, unknown> | undefined;
  open: boolean; uploading: boolean;
  error: string | undefined; success: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [chosen, setChosen] = useState<File | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    setChosen(file);
    onUpload(file);
  }

  const done = success || !!existing;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${error ? "#fecaca" : done ? "#bbf7d0" : "#e5e7eb"}` }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: done ? "#f0fdf4" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-neutral-600">{type.toUpperCase()}</span>
          <span className="text-xs text-neutral-400">{HINT[type]}</span>
        </div>
        {done && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}>
            <IconCheck size={11} /> {success ? "Uploaded" : "Submitted"}
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        {error && <FormError message={error} />}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg py-5 text-center transition-all"
          style={{
            border: `2px dashed ${dragging ? "#1e3a5f" : chosen ? "#16a34a" : "#d1d5db"}`,
            backgroundColor: dragging ? "#eff6ff" : chosen ? "#f0fdf4" : "#fafafa",
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300"
                style={{ borderTopColor: "#1e3a5f" }} />
              <span className="text-xs text-neutral-500">Uploading…</span>
            </div>
          ) : chosen ? (
            <>
              <IconCheck size={18} style={{ color: "#16a34a" }} />
              <p className="mt-1 text-xs font-medium" style={{ color: "#16a34a" }}>{chosen.name}</p>
              <p className="text-xs text-neutral-400">{(chosen.size / 1_048_576).toFixed(2)} MB · Click to change</p>
            </>
          ) : (
            <>
              <IconUpload size={20} style={{ color: "#9ca3af" }} />
              <p className="mt-1.5 text-sm font-medium text-neutral-600">
                Drop file or <span style={{ color: "#1e3a5f" }}>click to browse</span>
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">{HINT[type]}</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT[type]} className="hidden"
          disabled={uploading} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function GitHubInput({
  existing, open, uploading, error, success, value, onChange, onSubmit,
}: {
  existing: Record<string, unknown> | undefined;
  open: boolean; uploading: boolean;
  error: string | undefined; success: boolean;
  value: string; onChange: (v: string) => void; onSubmit: () => void;
}) {
  const [localError, setLocalError] = useState("");
  const done = success || !!existing;

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) { setLocalError("Enter a GitHub repository URL before submitting."); return; }
    if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(trimmed)) {
      setLocalError("Must be a valid repo URL: https://github.com/owner/repo");
      return;
    }
    setLocalError("");
    onSubmit();
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${(error || localError) ? "#fecaca" : done ? "#bbf7d0" : "#e5e7eb"}` }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: done ? "#f0fdf4" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
        <span className="text-xs font-bold tracking-widest text-neutral-600">GITHUB</span>
        {done && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}>
            <IconCheck size={11} /> Submitted
          </span>
        )}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {(error || localError) && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <IconAlertCircle size={14} style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "#dc2626" }}>{localError || error}</p>
          </div>
        )}
        {existing && (
          <p className="text-xs" style={{ color: "#16a34a" }}>
            Current:{" "}
            <a href={String(existing.github_url)} target="_blank" rel="noopener noreferrer"
              className="underline" style={{ color: "#1e3a5f" }}>
              {String(existing.github_url)}
            </a>
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={value}
            onChange={(e) => { onChange(e.target.value); setLocalError(""); }}
            className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ border: `1px solid ${localError ? "#fecaca" : "#d1d5db"}`, backgroundColor: "#fff" }}
          />
          <Button variant="primary" size="sm" isLoading={uploading} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClosedWindowSummary({
  ppt, report, github,
}: {
  ppt: Record<string, unknown> | undefined;
  report: Record<string, unknown> | undefined;
  github: Record<string, unknown> | undefined;
}) {
  const hasAny = ppt || report || github;
  const [loading, setLoading] = useState<string | null>(null);

  async function viewFile(submissionId: string, label: string) {
    setLoading(submissionId);
    const res = await fetch(`/api/submissions/${submissionId}/url`);
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      alert(data.error ?? `Could not open ${label}.`);
    }
    setLoading(null);
  }

  if (!hasAny) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <span className="text-xs text-neutral-400">No submissions recorded for this window.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 rounded-xl overflow-hidden"
      style={{ border: "1px solid #e5e7eb" }}>
      <div className="px-4 py-2.5 text-xs font-semibold text-neutral-500"
        style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
        Submitted work (read-only)
      </div>
      <div className="flex flex-col divide-y divide-neutral-100">
        {ppt && (
          <div className="flex items-center gap-3 px-4 py-3">
            <IconFileText size={14} style={{ color: "#1e3a5f", flexShrink: 0 }} />
            <div className="flex-1">
              <span className="text-xs font-semibold text-neutral-600">PPT</span>
              <span className="ml-2 text-xs text-neutral-400">Presentation file</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium mr-3" style={{ color: "#16a34a" }}>
              <IconCheck size={11} /> Submitted
            </span>
            <button
              type="button"
              onClick={() => viewFile(String(ppt.id), "PPT")}
              disabled={loading === String(ppt.id)}
              className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "#eff6ff", color: "#1e3a5f", border: "1px solid #bfdbfe" }}
            >
              {loading === String(ppt.id) ? "Loading…" : "View"}
            </button>
          </div>
        )}
        {report && (
          <div className="flex items-center gap-3 px-4 py-3">
            <IconFileText size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
            <div className="flex-1">
              <span className="text-xs font-semibold text-neutral-600">Report</span>
              <span className="ml-2 text-xs text-neutral-400">PDF document</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium mr-3" style={{ color: "#16a34a" }}>
              <IconCheck size={11} /> Submitted
            </span>
            <button
              type="button"
              onClick={() => viewFile(String(report.id), "Report")}
              disabled={loading === String(report.id)}
              className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}
            >
              {loading === String(report.id) ? "Loading…" : "View"}
            </button>
          </div>
        )}
        {github && (
          <div className="flex items-center gap-3 px-4 py-3">
            <IconGitHub size={14} style={{ color: "#374151", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-neutral-600">GitHub</span>
              <a href={String(github.github_url)} target="_blank" rel="noopener noreferrer"
                className="ml-2 text-xs underline"
                style={{ color: "#1e3a5f" }}>
                {String(github.github_url)}
              </a>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}>
              <IconCheck size={11} /> Submitted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubmissionsClient({ teamId, milestones, windows, existingSubmissions }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [githubUrls, setGithubUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [successes, setSuccesses] = useState<Record<string, boolean>>({});

  if (!teamId || milestones.length === 0) {
    return (
      <EmptyState
        title="No active milestones"
        description="Submission windows will appear once your proposal is approved and milestones are set."
      />
    );
  }

  function getWindowsForMilestone(milestoneId: string) {
    return windows.filter((w) => w.milestone_id === milestoneId);
  }

  function getSubmission(windowId: string, type: string) {
    return existingSubmissions.find(
      (s) => s.window_id === windowId && s.artefact_type === type
    );
  }

  async function uploadFile(file: File, type: "ppt" | "report", milestoneId: string, windowId: string) {
    const key = `${windowId}-${type}`;
    setUploading(key);
    setErrors((p) => ({ ...p, [key]: undefined }));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("team_id", teamId!);
    fd.append("milestone_id", milestoneId);
    fd.append("window_id", windowId);
    const res = await fetch(`/api/submissions/${type}`, { method: "POST", body: fd });
    const data = await res.json() as { error?: string };
    if (!res.ok) setErrors((p) => ({ ...p, [key]: data.error ?? "Upload failed." }));
    else setSuccesses((p) => ({ ...p, [key]: true }));
    setUploading(null);
  }

  async function submitGithub(milestoneId: string, windowId: string) {
    const key = `${windowId}-github_link`;
    const url = githubUrls[key] ?? "";
    setUploading(key);
    setErrors((p) => ({ ...p, [key]: undefined }));
    const res = await fetch("/api/submissions/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, milestone_id: milestoneId, window_id: windowId, github_url: url }),
    });
    const data = await res.json() as { error?: string; fields?: Record<string, string[]> };
    if (!res.ok) {
      const fieldMsg = data.fields ? Object.values(data.fields).flat()[0] : undefined;
      setErrors((p) => ({ ...p, [key]: fieldMsg ?? data.error ?? "Submission failed." }));
    } else {
      setSuccesses((p) => ({ ...p, [key]: true }));
    }
    setUploading(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {milestones.map((m) => {
        const milestoneWindows = getWindowsForMilestone(String(m.id));
        return (
          <Card key={String(m.id)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{String(m.name)}</CardTitle>
                <Badge variant={m.status === "completed" ? "approved" : m.status === "missed" ? "rejected" : "pending"}>
                  {String(m.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {milestoneWindows.length === 0 ? (
                <p className="text-sm text-neutral-500">No submission windows defined for this milestone.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {milestoneWindows.map((w) => {
                    const open = isWindowOpen(new Date(String(w.opens_at)), new Date(String(w.closes_at)));
                    const wid  = String(w.id);

                    return (
                      <div key={wid} className="flex flex-col gap-3">
                        {/* Window header */}
                        <div className="flex items-center gap-2">
                          <Badge variant={open ? "approved" : "neutral"}>
                            {open ? "Window Open" : "Window Closed"}
                          </Badge>
                          <span className="text-xs text-neutral-500">
                            {formatDateTime(String(w.opens_at))}{" "}
                            <span style={{ color: "#9ca3af" }}>to</span>{" "}
                            {formatDateTime(String(w.closes_at))}
                          </span>
                        </div>

                        {open ? (
                          /* open: upload zones */
                          <>
                            {(["ppt", "report"] as const).map((type) => (
                              <FileUploadZone
                                key={type}
                                type={type}
                                existing={getSubmission(wid, type)}
                                open={true}
                                uploading={uploading === `${wid}-${type}`}
                                error={errors[`${wid}-${type}`]}
                                success={successes[`${wid}-${type}`] ?? false}
                                onUpload={(file) => uploadFile(file, type, String(m.id), wid)}
                              />
                            ))}
                            <GitHubInput
                              existing={getSubmission(wid, "github_link")}
                              open={true}
                              uploading={uploading === `${wid}-github_link`}
                              error={errors[`${wid}-github_link`]}
                              success={successes[`${wid}-github_link`] ?? false}
                              value={githubUrls[`${wid}-github_link`] ?? ""}
                              onChange={(v) => setGithubUrls((p) => ({ ...p, [`${wid}-github_link`]: v }))}
                              onSubmit={() => submitGithub(String(m.id), wid)}
                            />
                          </>
                        ) : (
                          /* closed: single read-only summary */
                          <ClosedWindowSummary
                            ppt={getSubmission(wid, "ppt")}
                            report={getSubmission(wid, "report")}
                            github={getSubmission(wid, "github_link")}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
