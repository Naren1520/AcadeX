"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { EmptyState } from "@/components/feedback/Skeleton";
import { IconCheck } from "@/components/ui/Icon";
import { isWindowOpen, formatDateTime } from "@/lib/dates";

interface Props {
  teamId: string | null;
  milestones: Record<string, unknown>[];
  windows: Record<string, unknown>[];
  existingSubmissions: Record<string, unknown>[];
}

export function SubmissionsClient({ teamId, milestones, windows, existingSubmissions }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [githubUrls, setGithubUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [successes, setSuccesses] = useState<Record<string, boolean>>({});

  if (!teamId || milestones.length === 0) {
    return <EmptyState title="No active milestones" description="Submission windows will appear once your proposal is approved and milestones are set." />;
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
    setErrors((p) => ({ ...p, [key]: "" }));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("team_id", teamId!);
    fd.append("milestone_id", milestoneId);
    fd.append("window_id", windowId);

    const res = await fetch(`/api/submissions/${type}`, { method: "POST", body: fd });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      setErrors((p) => ({ ...p, [key]: data.error ?? "Upload failed." }));
    } else {
      setSuccesses((p) => ({ ...p, [key]: true }));
    }
    setUploading(null);
  }

  async function submitGithub(milestoneId: string, windowId: string) {
    const key = `${windowId}-github_link`;
    const url = githubUrls[key] ?? "";
    setUploading(key);
    setErrors((p) => ({ ...p, [key]: "" }));

    const res = await fetch("/api/submissions/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, milestone_id: milestoneId, window_id: windowId, github_url: url }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      setErrors((p) => ({ ...p, [key]: data.error ?? "Submission failed." }));
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
                milestoneWindows.map((w) => {
                  const open = isWindowOpen(new Date(String(w.opens_at)), new Date(String(w.closes_at)));
                  return (
                    <div key={String(w.id)} className="mb-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant={open ? "approved" : "neutral"}>{open ? "Window Open" : "Window Closed"}</Badge>
                        <span className="text-xs text-neutral-500">
                          {formatDateTime(String(w.opens_at))} <span style={{ color: "#9ca3af" }}>to</span> {formatDateTime(String(w.closes_at))}
                        </span>
                      </div>

                      {/* PPT Upload */}
                      {(["ppt", "report"] as const).map((type) => {
                        const key = `${String(w.id)}-${type}`;
                        const existing = getSubmission(String(w.id), type);
                        const isUploading = uploading === key;
                        return (
                          <div key={type} className="mb-3 rounded p-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-neutral-700 uppercase">{type}</span>
                              {existing && (
                                <span className="text-xs text-green-600">
                                  Submitted {!!existing.storage_path && <IconCheck size={12} style={{ display: "inline", verticalAlign: "middle", color: "#16a34a" }} />}
                                  {successes[key] && " (updated)"}
                                </span>
                              )}
                            </div>
                            {errors[key] && <FormError message={errors[key]} />}
                            {open && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  accept={type === "ppt" ? ".pptx,.ppt" : ".pdf"}
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadFile(file, type, String(m.id), String(w.id));
                                  }}
                                  className="text-xs text-neutral-600"
                                  aria-label={`Upload ${type.toUpperCase()}`}
                                />
                                {isUploading && <span className="text-xs text-neutral-500">Uploading…</span>}
                              </div>
                            )}
                            {existing && !open && (
                              <p className="text-xs text-neutral-500">Window closed. Submission recorded.</p>
                            )}
                          </div>
                        );
                      })}

                      {/* GitHub link */}
                      {(() => {
                        const key = `${String(w.id)}-github_link`;
                        const existing = getSubmission(String(w.id), "github_link");
                        return (
                          <div className="rounded p-3" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                            <p className="text-sm font-medium text-neutral-700 mb-2">GitHub Repository</p>
                            {errors[key] && <FormError message={errors[key]} />}
                            {existing && (
                              <p className="mb-2 text-xs text-green-600">
                                Current: <a href={String(existing.github_url)} target="_blank" rel="noopener noreferrer" style={{ color: "#1e3a5f" }}>{String(existing.github_url)}</a>
                              </p>
                            )}
                            {open && (
                              <div className="flex gap-2">
                                <Input
                                  label=""
                                  placeholder="https://github.com/owner/repo"
                                  value={githubUrls[key] ?? ""}
                                  onChange={(e) => setGithubUrls((p) => ({ ...p, [key]: e.target.value }))}
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex-shrink-0 mt-0"
                                  isLoading={uploading === key}
                                  onClick={() => submitGithub(String(m.id), String(w.id))}
                                >
                                  Submit
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
