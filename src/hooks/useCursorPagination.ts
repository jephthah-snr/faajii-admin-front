import { useState } from "react";

interface CursorPaginationParams<T> {
  rowsPerPage: number;
  extractCursor: (item: T) => string | undefined;
}

export function useCursorPagination<T>({
  rowsPerPage,
  extractCursor,
}: CursorPaginationParams<T>) {
  const [activePage, setActivePage] = useState(1);
  const [cursorMap, setCursorMap] = useState<{
    [page: number]: string | undefined;
  }>({
    1: undefined,
  });

  const cursor = cursorMap[activePage];

  const updatePagination = (data: T[], pageInfo?: { hasNextPage: boolean }) => {
    if (!data || data.length === 0) return;

    const lastItem = data[data.length - 1];
    const nextCursor = extractCursor(lastItem);
    const nextPage = activePage + 1;

    if (pageInfo?.hasNextPage && nextCursor) {
      setCursorMap((prev) => {
        if (prev[nextPage]) return prev;
        return { ...prev, [nextPage]: nextCursor };
      });
    }
  };

  const totalPages = Object.keys(cursorMap).length;
  const totalItems = totalPages * rowsPerPage;

  return {
    activePage,
    setActivePage,
    cursor,
    updatePagination,
    totalItems,
  };
}
