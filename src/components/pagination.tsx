'use client';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showLabels?: boolean;
}

/**
 * Adaptive 7-slot sliding window pagination algorithm
 * Guarantees a stable item count across pages:
 * - When near start (<= 4): 1 2 3 4 5 ... Last
 * - When near end (>= Last - 3): 1 ... Last-4 Last-3 Last-2 Last-1 Last
 * - When in middle: 1 ... C-1 C C+1 ... Last
 */
export function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  // Case 1: Near beginning (1 to 5 ... last)
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  // Case 2: Near end (1 ... last 5)
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  // Case 3: In middle (1 ... current-1, current, current+1 ... last)
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showLabels = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`mt-12 flex items-center justify-center gap-1 sm:gap-2 py-6 border-t border-slate-100 w-full select-none ${className}`}
    >
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-95 shrink-0"
        aria-label="Previous page"
      >
        <IconChevronLeft size={16} strokeWidth={2.5} />
        {showLabels && (
          <span className="hidden sm:inline text-[11px] font-sans uppercase tracking-widest">
            Prev
          </span>
        )}
      </button>

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 h-8 sm:w-8 sm:h-9 flex items-center justify-center text-slate-400 text-xs font-mono select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#10175b] text-white shadow-md shadow-[#10175b]/20 scale-105'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-[#10175b] border border-slate-200/80 active:scale-95'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to page ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-[#10175b] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-95 shrink-0"
        aria-label="Next page"
      >
        {showLabels && (
          <span className="hidden sm:inline text-[11px] font-sans uppercase tracking-widest">
            Next
          </span>
        )}
        <IconChevronRight size={16} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
