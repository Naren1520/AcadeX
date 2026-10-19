"use client";

import { useState } from "react";
import { EmptyState } from "@/components/feedback/Skeleton";
import { IconArrowUp, IconArrowDown, IconChevronUpDown } from "@/components/ui/Icon";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: T) => React.ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onSort?: (key: string, direction: SortDirection) => void;
  caption?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: SortDirection };
  onSort: (key: string, direction: SortDirection) => void;
}) {
  const isActive = currentSort.key === sortKey;
  const nextDirection: SortDirection =
    !isActive ? "asc" : currentSort.direction === "asc" ? "desc" : null;

  return (
    <button
      className="flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-900"
      onClick={() => onSort(sortKey, nextDirection)}
      aria-sort={
        isActive
          ? currentSort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      {label}
      <span aria-hidden="true" className="ml-1 inline-flex items-center text-neutral-400">
        {isActive && currentSort.direction === "asc" ? (
          <IconArrowUp size={12} />
        ) : isActive && currentSort.direction === "desc" ? (
          <IconArrowDown size={12} />
        ) : (
          <IconChevronUpDown size={12} />
        )}
      </span>
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T = any>({
  columns,
  data,
  emptyMessage = "No records found.",
  onSort,
  caption,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>({
    key: "",
    direction: null,
  });

  function handleSort(key: string, direction: SortDirection) {
    setSort({ key, direction });
    onSort?.(key, direction);
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600 ${col.className ?? ""}`}
              >
                {col.sortable ? (
                  <SortableHeader
                    label={col.header}
                    sortKey={col.key}
                    currentSort={sort}
                    onSort={handleSort}
                  />
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: rowIndex % 2 === 1 ? "#f9fafb" : "#ffffff",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-neutral-800 ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
