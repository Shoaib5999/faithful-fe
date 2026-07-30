import type { Order, Customer } from "@/types/commerce.types";

const NON_REVENUE_ORDER_STATUSES = new Set(["CANCELLED", "RETURNED"]);

export const isRevenueOrder = (status: string): boolean =>
  !NON_REVENUE_ORDER_STATUSES.has(status.toUpperCase());

export const toLocalDateKey = (value: string | Date): string => {
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const groupByDate = <T>(items: T[], dateExtractor: (item: T) => string): Record<string, number> => {
  const result: Record<string, number> = {};
  items.forEach((item) => {
    const dateKey = toLocalDateKey(dateExtractor(item));
    result[dateKey] = (result[dateKey] || 0) + 1;
  });
  return result;
};

export const sumField = <T>(items: T[], fieldExtractor: (item: T) => number): number => {
  return items.reduce((sum, item) => sum + fieldExtractor(item), 0);
};

export const topN = (pairs: Array<{ name: string; value: number }>, n: number): Array<{ name: string; value: number }> => {
  return [...pairs].sort((a, b) => b.value - a.value).slice(0, n);
};

export const filterByDateRange = <T>(
  items: T[],
  dateExtractor: (item: T) => string,
  range: { from: Date | null; to: Date | null }
): T[] => {
  const from = range.from
    ? new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 0, 0, 0, 0)
    : null;
  const to = range.to
    ? new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999)
    : null;

  return items.filter((item) => {
    const date = new Date(dateExtractor(item));
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
};

export const formatDayLabel = (dateString: string): string => {
  const d = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};
