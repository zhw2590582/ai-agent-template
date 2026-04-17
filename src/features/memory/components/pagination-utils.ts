'use client';

export type PaginationEntry = number | 'ellipsis-left' | 'ellipsis-right';

export function buildPaginationEntries(currentPage: number, totalPages: number): PaginationEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const entries: PaginationEntry[] = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    entries.push('ellipsis-left');
  }

  for (let page = startPage; page <= endPage; page += 1) {
    entries.push(page);
  }

  if (endPage < totalPages - 1) {
    entries.push('ellipsis-right');
  }

  entries.push(totalPages);
  return entries;
}
