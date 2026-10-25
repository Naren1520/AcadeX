"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SkeletonTable } from "@/components/feedback/Skeleton";
import { IconDownload } from "@/components/ui/Icon";

// ── Types 
interface AuditEntry {
  event_id: string;
  actor_id: string;
  actor_role: string;
  actor_email: string | null;
  action_type: string;
  target_table: string;
  target_record_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ── Action type options 
const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  // Auth
  { value: "user.login",            label: "Login" },
  { value: "user.logout",           label: "Logout" },
  // User management
  { value: "user.created",          label: "User Created" },
  { value: "user.edited",           label: "User Edited" },
  { value: "user.deleted",          label: "User Deleted" },
  { value: "user.password_changed", label: "Password Changed" },
  // Structure
  { value: "department.created",    label: "Department Created" },
  { value: "department.updated",    label: "Department Updated" },
  { value: "department.deactivated",label: "Department Deactivated" },
  { value: "academic_year.created", label: "Academic Year Created" },
  { value: "academic_year.closed",  label: "Academic Year Closed" },
  { value: "semester.created",      label: "Semester Created" },
  { value: "semester.closed",       label: "Semester Closed" },
  { value: "section.created",       label: "Section Created" },
  { value: "faculty.assigned",      label: "Faculty Assigned" },
  { value: "faculty.unassigned",    label: "Faculty Unassigned" },
  { value: "student.section_assigned", label: "Student Section Assigned" },
  // Academic
  { value: "cgpa.updated",          label: "CGPA Updated" },
  { value: "team.formed",           label: "Team Formed" },
  { value: "team.member_added",     label: "Team Member Added" },
  { value: "team.member_removed",   label: "Team Member Removed" },
  { value: "proposal.submitted",    label: "Proposal Submitted" },
  { value: "proposal.approved",     label: "Proposal Approved" },
  { value: "proposal.rejected",     label: "Proposal Rejected" },
  { value: "proposal.revision_requested", label: "Revision Requested" },
  { value: "milestone.created",     label: "Milestone Created" },
  { value: "milestone.deadline_updated", label: "Milestone Deadline Updated" },
  { value: "submission.uploaded",   label: "Submission Uploaded" },
  { value: "file.uploaded",         label: "File Uploaded" },
  { value: "file.accessed",         label: "File Accessed" },
];

// ── Role badge variant 
function roleBadge(role: string) {
  const v = role === "admin" ? "neutral" : role === "faculty" ? "approved" : role === "student" ? "pending" : "neutral";
  return <Badge variant={v}>{role}</Badge>;
}

// ── Action label chip 
const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  "user.login":             { bg: "#f0fdf4", color: "#16a34a" },
  "user.logout":            { bg: "#f9fafb", color: "#6b7280" },
  "user.created":           { bg: "#eff6ff", color: "#1e3a5f" },
  "user.edited":            { bg: "#fefce8", color: "#ca8a04" },
  "user.deleted":           { bg: "#fef2f2", color: "#dc2626" },
  "user.password_changed":  { bg: "#fef3c7", color: "#b45309" },
  "proposal.approved":      { bg: "#f0fdf4", color: "#16a34a" },
  "proposal.rejected":      { bg: "#fef2f2", color: "#dc2626" },
  "department.deactivated": { bg: "#fef2f2", color: "#dc2626" },
  "academic_year.closed":   { bg: "#fef2f2", color: "#dc2626" },
  "semester.closed":        { bg: "#fef2f2", color: "#dc2626" },
};

function actionChip(action: string) {
  const c = ACTION_COLORS[action] ?? { bg: "#f3f4f6", color: "#374151" };
  const label = ACTION_OPTIONS.find((o) => o.value === action)?.label ?? action;
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {label}
    </span>
  );
}

// ── Format timestamp 
function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Parse user-agent to device hint 
function deviceHint(ua: string | null) {
  if (!ua) return "—";
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

// ── Main component 
export function AuditLogsClient() {
  const [entries, setEntries]       = useState<AuditEntry[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [isLoading, setIsLoading]   = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Filters
  const [email, setEmail]           = useState("");
  const [actionType, setActionType] = useState("");
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");

  // Detail panel
  const [selected, setSelected]     = useState<AuditEntry | null>(null);

  function buildParams(extraPage?: number) {
    const params = new URLSearchParams({ page: String(extraPage ?? page) });
    if (email)      params.set("actor_email", email);
    if (actionType) params.set("action_type", actionType);
    if (fromDate)   params.set("from", new Date(fromDate).toISOString());
    if (toDate) {
      const t = new Date(toDate); t.setHours(23, 59, 59, 999);
      params.set("to", t.toISOString());
    }
    return params;
  }

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/audit-logs?${buildParams()}`);
    if (res.ok) {
      const data = await res.json() as { entries: AuditEntry[]; total: number };
      setEntries(data.entries ?? []);
      setTotal(data.total ?? 0);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, email, actionType, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => { setter(v); setPage(1); };
  }

  async function handleDownload() {
    setDownloading(true);
    const params = buildParams();
    params.set("export", "csv");
    const res = await fetch(`/api/admin/audit-logs?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(false);
  }

  const columns = [
    {
      key: "created_at", header: "Timestamp",
      render: (r: AuditEntry) => (
        <span className="whitespace-nowrap text-xs text-neutral-600">{fmt(r.created_at)}</span>
      ),
    },
    {
      key: "actor_email", header: "User",
      render: (r: AuditEntry) => (
        <div>
          <p className="text-xs font-medium text-neutral-800">{r.actor_email ?? "—"}</p>
          {roleBadge(r.actor_role)}
        </div>
      ),
    },
    {
      key: "action_type", header: "Action",
      render: (r: AuditEntry) => actionChip(r.action_type),
    },
    {
      key: "target_table", header: "Target",
      render: (r: AuditEntry) => (
        <div>
          <span className="text-xs font-medium text-neutral-700">{r.target_table}</span>
          <p className="font-mono text-xs text-neutral-400">{r.target_record_id.slice(0, 8)}…</p>
        </div>
      ),
    },
    {
      key: "ip_address", header: "IP / Device",
      render: (r: AuditEntry) => (
        <div>
          <p className="text-xs text-neutral-600">{r.ip_address ?? "—"}</p>
          <p className="text-xs text-neutral-400">{deviceHint(r.user_agent)}</p>
        </div>
      ),
    },
    {
      key: "details", header: "",
      render: (r: AuditEntry) => (
        <button
          type="button"
          onClick={() => setSelected(r)}
          className="cursor-pointer text-xs underline"
          style={{ color: "#1e3a5f" }}
        >
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Filters + Download ── */}
      <div className="rounded-xl p-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-700">Filters</p>
          <Button variant="secondary" size="sm" isLoading={downloading} onClick={handleDownload}>
            <IconDownload size={14} />
            Export CSV
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="User email"
            value={email}
            onChange={(e) => handleFilterChange(setEmail)(e.target.value)}
            placeholder="Search by email…"
          />
          <Select
            label="Action type"
            value={actionType}
            onValueChange={handleFilterChange(setActionType)}
            options={ACTION_OPTIONS}
          />
          <Input
            label="From date"
            type="date"
            value={fromDate}
            onChange={(e) => handleFilterChange(setFromDate)(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={toDate}
            onChange={(e) => handleFilterChange(setToDate)(e.target.value)}
          />
        </div>
        {(email || actionType || fromDate || toDate) && (
          <button
            type="button"
            className="mt-2 cursor-pointer text-xs text-neutral-500 underline hover:text-neutral-800"
            onClick={() => { setEmail(""); setActionType(""); setFromDate(""); setToDate(""); setPage(1); }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: "#f9fafb" }}>
              <p className="text-sm text-neutral-600">
                <strong>{total.toLocaleString()}</strong> entries
                {(email || actionType || fromDate || toDate) && " (filtered)"}
              </p>
            </div>
            <DataTable
              columns={columns}
              data={entries}
              emptyMessage="No audit log entries match the current filters."
              caption="Audit log entries"
            />
            <div className="px-4 py-2" style={{ borderTop: "1px solid #e5e7eb" }}>
              <Pagination page={page} total={total} pageSize={50} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* ── Detail slide-in panel ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
            style={{ borderLeft: "1px solid #e5e7eb" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
              <div>
                <p className="font-semibold text-neutral-900">Event Details</p>
                <p className="text-xs text-neutral-500 font-mono">{selected.event_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="cursor-pointer rounded p-1.5 text-neutral-400 hover:text-neutral-700"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 4L4 12M4 4l8 8" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 px-5 py-5 text-sm">

              {/* When */}
              <Section label="When">
                <p className="text-neutral-800">{fmt(selected.created_at)}</p>
              </Section>

              {/* Who */}
              <Section label="Who">
                <p className="font-medium text-neutral-800">{selected.actor_email ?? "—"}</p>
                <div className="mt-0.5">{roleBadge(selected.actor_role)}</div>
              </Section>

              {/* What */}
              <Section label="Action">
                {actionChip(selected.action_type)}
                <p className="mt-1 text-xs text-neutral-500">
                  Table: <strong>{selected.target_table}</strong>
                </p>
                <p className="font-mono text-xs text-neutral-400">
                  Record: {selected.target_record_id}
                </p>
              </Section>

              {/* Where */}
              <Section label="Device / Location">
                <Row k="IP Address"  v={selected.ip_address ?? "—"} />
                <Row k="Device"      v={deviceHint(selected.user_agent)} />
                <Row k="User Agent"  v={selected.user_agent ?? "—"} mono />
              </Section>

              {/* Before */}
              {selected.previous_value && Object.keys(selected.previous_value).length > 0 && (
                <Section label="Before (previous value)">
                  <pre className="overflow-x-auto rounded p-3 text-xs" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
                    {JSON.stringify(selected.previous_value, null, 2)}
                  </pre>
                </Section>
              )}

              {/* After */}
              {selected.new_value && Object.keys(selected.new_value).length > 0 && (
                <Section label="After (new value)">
                  <pre className="overflow-x-auto rounded p-3 text-xs" style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}>
                    {JSON.stringify(selected.new_value, null, 2)}
                  </pre>
                </Section>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Small helpers 
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      {children}
    </div>
  );
}

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-0.5">
      <span className="text-xs text-neutral-500 flex-shrink-0">{k}</span>
      <span className={`text-xs text-neutral-800 text-right ${mono ? "font-mono break-all" : ""}`}>{v}</span>
    </div>
  );
}
