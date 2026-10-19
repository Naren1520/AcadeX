"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/feedback/Skeleton";
import { formatDateTime } from "@/lib/dates";

interface AuditEntry {
  event_id: string;
  actor_id: string;
  actor_role: string;
  action_type: string;
  target_table: string;
  target_record_id: string;
  created_at: string;
}

export function AuditLogsClient() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (actionType) params.set("action_type", actionType);
    if (fromDate) params.set("from", new Date(fromDate).toISOString());
    if (toDate) params.set("to", new Date(toDate).toISOString());

    const res = await fetch(`/api/admin/audit-logs?${params}`);
    if (res.ok) {
      const data = await res.json() as { entries: AuditEntry[]; total: number };
      setEntries(data.entries);
      setTotal(data.total);
    }
    setIsLoading(false);
  }, [page, actionType, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: "created_at", header: "Timestamp", render: (r: AuditEntry) => <span className="whitespace-nowrap text-xs">{formatDateTime(r.created_at)}</span> },
    { key: "actor_role", header: "Role", render: (r: AuditEntry) => <span className="capitalize">{r.actor_role}</span> },
    { key: "action_type", header: "Action", render: (r: AuditEntry) => <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">{r.action_type}</code> },
    { key: "target_table", header: "Table" },
    { key: "target_record_id", header: "Record ID", render: (r: AuditEntry) => <span className="font-mono text-xs text-neutral-500">{r.target_record_id.slice(0, 8)}…</span> },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-48">
          <Input label="Action type" value={actionType} onChange={(e) => { setActionType(e.target.value); setPage(1); }} placeholder="e.g. user.login" />
        </div>
        <div className="w-44">
          <Input label="From date" type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
        </div>
        <div className="w-44">
          <Input label="To date" type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="rounded" style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
        {isLoading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : (
          <>
            <DataTable columns={columns} data={entries} emptyMessage="No audit log entries found." caption="Audit log entries" />
            <div className="px-4" style={{ borderTop: "1px solid #e5e7eb" }}>
              <Pagination page={page} total={total} pageSize={50} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
