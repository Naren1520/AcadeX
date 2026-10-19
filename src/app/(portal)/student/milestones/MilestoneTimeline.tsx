"use client";

import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/dates";

interface Milestone {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: "open" | "completed" | "missed";
}

const statusVariant: Record<Milestone["status"], "pending" | "approved" | "rejected"> = {
  open: "pending",
  completed: "approved",
  missed: "rejected",
};

export function MilestoneTimeline({
  milestones,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  milestones: any[];
}) {
  const now = Date.now();

  return (
    <ol className="relative flex flex-col gap-0" aria-label="Milestone timeline">
      {milestones.map((m: Milestone, i: number) => {
        const deadlineMs = new Date(m.deadline).getTime();
        const isPast = deadlineMs < now;
        const daysLeft = Math.ceil((deadlineMs - now) / 86_400_000);

        return (
          <li key={m.id} className="relative flex gap-4 pb-8">
            {/* Vertical timeline connector */}
            {i < milestones.length - 1 && (
              <div
                className="absolute bottom-0 left-3.5 top-8 w-px"
                style={{ backgroundColor: "#e5e7eb" }}
                aria-hidden="true"
              />
            )}

            {/* Step dot */}
            <div
              className="relative z-10 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                backgroundColor:
                  m.status === "completed"
                    ? "#16a34a"
                    : m.status === "missed"
                    ? "#dc2626"
                    : "#1e3a5f",
              }}
              aria-hidden="true"
            >
              {i + 1}
            </div>

            {/* Card */}
            <div
              className="flex-1 rounded p-4"
              style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-900">{m.name}</h3>
                    <Badge variant={statusVariant[m.status]}>
                      {m.status}
                    </Badge>
                  </div>
                  {m.description && (
                    <p className="mt-1 text-sm text-neutral-500">{m.description}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {formatDate(m.deadline)}
                  </p>
                  {m.status === "open" && (
                    <p
                      className={`text-xs ${
                        isPast
                          ? "text-red-600"
                          : daysLeft <= 2
                          ? "text-orange-600"
                          : "text-neutral-500"
                      }`}
                    >
                      {isPast ? "Overdue" : `${daysLeft}d remaining`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
