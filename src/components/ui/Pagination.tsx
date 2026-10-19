interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex items-center justify-between py-3"
      aria-label="Pagination"
    >
      <p className="text-sm text-neutral-500">
        {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded px-3 py-1.5 text-sm text-neutral-700 transition-colors disabled:opacity-40"
          style={{ border: "1px solid #e5e7eb" }}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === page;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
              className="rounded px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                border: "1px solid #e5e7eb",
                backgroundColor: isActive ? "#1e3a5f" : "#ffffff",
                color: isActive ? "#ffffff" : "#374151",
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="rounded px-3 py-1.5 text-sm text-neutral-700 transition-colors disabled:opacity-40"
          style={{ border: "1px solid #e5e7eb" }}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
