import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  label = "items",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;
  const current = Math.min(page, totalPages);
  useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav
      aria-label={`${label} pagination`}
      className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs font-medium text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {start}–{end}
        </span>{" "}
        of <span className="font-bold text-slate-700">{totalItems}</span>{" "}
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={16} />{" "}
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pages.map((n) => (
          <button
            type="button"
            key={n}
            aria-current={n === current ? "page" : undefined}
            aria-label={`Page ${n}`}
            onClick={() => onPageChange(n)}
            className={`min-w-9 rounded-xl px-3 py-2 text-sm font-bold transition ${n === current ? "bg-purple-800 text-white shadow-sm" : "border border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50"}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
