import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Columns3,
  Download,
  FileX,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DataTableOneFilter {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export interface DataTableOneDateFilter {
  key: string;
  label: string;
  date?: Date;
  onChange: (date?: Date) => void;
  disabledDate?: (date: Date) => boolean;
}

export interface DataTableOneColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  hideable?: boolean;
  defaultHidden?: boolean;
  skeletonWidth?: "sm" | "md" | "lg" | "full";
}

export interface DataTableOneEmptyState {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface DataTableOneExportOptions {
  onExportCsv: () => Promise<void>;
  label?: string;
}

interface DataTableOneProps<T> {
  columns: DataTableOneColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;

  // Pagination
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  page?: number;
  pageSize?: number;
  total?: number;
  manualPagination?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Loading / Error
  loading?: boolean;
  skeletonRows?: number;
  error?: string | null;
  onRetry?: () => void;

  // Empty state
  emptyMessage?: string;
  emptyState?: DataTableOneEmptyState;

  // Expandable rows
  expandable?: boolean;
  onExpandRow?: (row: T) => Promise<React.ReactNode>;

  // Export
  exportOptions?: DataTableOneExportOptions;

  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  className?: string;
  toolbarFilters?: React.ReactNode;
  filters?: DataTableOneFilter[];
  dateFilters?: DataTableOneDateFilter[];
}

type SortDir = "asc" | "desc" | null;

// ---------------------------------------------------------------------------
// Skeleton width map
// ---------------------------------------------------------------------------

const SKELETON_WIDTH_MAP: Record<
  NonNullable<DataTableOneColumn<unknown>["skeletonWidth"]>,
  string
> = {
  sm: "w-12",
  md: "w-24",
  lg: "w-36",
  full: "w-full",
};

const SKELETON_FALLBACK_WIDTHS = ["w-20", "w-28", "w-16", "w-32", "w-24"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCell({ colIndex, width }: { colIndex: number; width?: string }) {
  const fallback = SKELETON_FALLBACK_WIDTHS[colIndex % SKELETON_FALLBACK_WIDTHS.length];
  return <div className={cn("h-4 rounded-xl bg-muted animate-pulse", width ?? fallback)} />;
}

function SkeletonRows<T>({ columns, count }: { columns: DataTableOneColumn<T>[]; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border last:border-0">
          {columns.map((column, colIndex) => (
            <td key={column.key} className="py-3 px-2">
              <SkeletonCell
                colIndex={colIndex}
                width={column.skeletonWidth ? SKELETON_WIDTH_MAP[column.skeletonWidth] : undefined}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyStateRow({
  colSpan,
  message,
  emptyState,
}: {
  colSpan: number;
  message: string;
  emptyState?: DataTableOneEmptyState;
}) {
  const icon = emptyState?.icon ?? (
    <FileX className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" strokeWidth={1.25} />
  );
  const title = emptyState?.title ?? message;
  const description = emptyState?.description;
  const action = emptyState?.action;

  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-1">
          {icon}
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{description}</p>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

function ErrorStateRow({
  colSpan,
  message,
  onRetry,
}: {
  colSpan: number;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-destructive">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="text-xs">
              Try again
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function DateFilterPopover({ df }: { df: DataTableOneDateFilter }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full justify-start gap-1.5 text-xs font-normal sm:w-auto",
            !df.date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {df.date ? format(df.date, "MMM dd, yyyy") : df.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={false}
      >
        <Calendar
          mode="single"
          selected={df.date}
          onSelect={(date: Date | undefined) => {
            df.onChange(date);
            setOpen(false);
          }}
          disabled={df.disabledDate}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

function ExportButton({ options }: { options: DataTableOneExportOptions }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await options.onExportCsv();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground md:w-auto"
    >
      {exporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {options.label ?? "Export CSV"}
    </Button>
  );
}

function ExpandedRowContent({
  colSpan,
  rowKey,
  cache,
  loader,
}: {
  colSpan: number;
  rowKey: string;
  cache: React.MutableRefObject<Map<string, React.ReactNode>>;
  loader: () => Promise<React.ReactNode>;
}) {
  const [content, setContent] = useState<React.ReactNode>(cache.current.get(rowKey) ?? null);
  const [loading, setLoading] = useState(!cache.current.has(rowKey));

  React.useEffect(() => {
    if (cache.current.has(rowKey)) {
      setContent(cache.current.get(rowKey)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    loader().then((result) => {
      if (cancelled) return;
      cache.current.set(rowKey, result);
      setContent(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [rowKey, loader, cache]);

  return (
    <tr className="bg-muted/20">
      <td colSpan={colSpan} className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading details…
          </div>
        ) : (
          content
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DataTableOne<T>({
  columns,
  data,
  keyExtractor,
  pageSizeOptions = [10, 15, 20, 50],
  defaultPageSize = 20,
  page,
  pageSize,
  total,
  manualPagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
  skeletonRows,
  error = null,
  onRetry,
  emptyMessage = "No records found",
  emptyState,
  expandable = false,
  onExpandRow,
  exportOptions,
  className,
  toolbarFilters,
  filters,
  dateFilters,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
}: DataTableOneProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [pageState, setPageState] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(defaultPageSize);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
    const set = new Set<string>();
    columns.forEach((col) => {
      if (col.defaultHidden) set.add(col.key);
    });
    return set;
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const expandCache = useRef<Map<string, React.ReactNode>>(new Map());

  const isManual = Boolean(
    manualPagination && page !== undefined && pageSize !== undefined && total !== undefined,
  );
  const activePage = isManual ? page! : pageState;
  const activePageSize = isManual ? pageSize! : pageSizeState;

  const hideableColumns = useMemo(
    () => columns.filter((col) => col.hideable !== false),
    [columns],
  );

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenCols.has(col.key)),
    [columns, hiddenCols],
  );

  const visibleHideableCount = useMemo(
    () => hideableColumns.filter((col) => !hiddenCols.has(col.key)).length,
    [hideableColumns, hiddenCols],
  );

  // +1 for the expand toggle column when expandable
  const effectiveColSpan = visibleColumns.length + (expandable ? 1 : 0);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortDir, sortKey, columns]);

  const totalItems = isManual ? total! : sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));
  const safePage = Math.min(activePage, totalPages);
  const paged = isManual
    ? sorted
    : sorted.slice((safePage - 1) * activePageSize, safePage * activePageSize);
  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * activePageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(safePage * activePageSize, totalItems);

  const resolvedSkeletonRows = skeletonRows ?? activePageSize;

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((curr) => (curr === "asc" ? "desc" : curr === "desc" ? null : "asc"));
        if (sortDir === "desc") setSortKey(null);
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPageState(1);
      if (isManual && onPageChange) onPageChange(1);
    },
    [isManual, onPageChange, sortDir, sortKey],
  );

  const toggleColumn = (key: string) => {
    setHiddenCols((prev) => {
      const isVisible = !prev.has(key);
      if (isVisible) {
        const visibleCount = hideableColumns.filter((col) => !prev.has(col.key)).length;
        if (visibleCount <= 1) return prev;
      }
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const hasHideableCols = columns.some((col) => col.hideable !== false);
  const hasFilters = Boolean(filters?.length);
  const hasDateFilters = Boolean(dateFilters?.length);
  const hasToolbarFilters = Boolean(toolbarFilters);
  const hasSearch = typeof onSearchChange === "function";
  const hasToolbar =
    hasHideableCols ||
    hasFilters ||
    hasDateFilters ||
    hasToolbarFilters ||
    hasSearch ||
    Boolean(exportOptions);

  const showSkeleton = loading && paged.length === 0;
  const showError = !loading && Boolean(error);
  const showEmpty = !loading && !error && paged.length === 0;
  const showData = !loading && !error && paged.length > 0;
  const showPagination = !loading && !error && sorted.length > 0;

  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {hasToolbar && (
        <div className="flex flex-col gap-2 px-3 pt-3 sm:px-4 sm:pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
            {hasSearch && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 rounded-full bg-secondary border-0 pl-8 pr-7 text-xs focus-visible:ring-primary"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2"
                    onClick={() => onSearchChange?.("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            {filters?.map((filter) => (
              <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="h-8 w-full text-xs sm:w-auto sm:min-w-[140px]">
                  <SelectValue placeholder={`All ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All {filter.label === "Optional" ? "" : filter.label}
                  </SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {dateFilters?.map((df) => (
              <DateFilterPopover key={df.key} df={df} />
            ))}
            {toolbarFilters}
          </div>

          <div className="flex items-center gap-2">
            {exportOptions && <ExportButton options={exportOptions} />}

            {hasHideableCols && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs text-muted-foreground hover:text-accent-foreground md:w-auto"
                  >
                    <Columns3 className="h-3.5 w-3.5" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {hideableColumns.map((col) => {
                    const isVisible = !hiddenCols.has(col.key);
                    const isLastVisible = isVisible && visibleHideableCount <= 1;

                    return (
                      <DropdownMenuCheckboxItem
                        key={col.key}
                        checked={isVisible}
                        disabled={isLastVisible}
                        onCheckedChange={() => toggleColumn(col.key)}
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="min-w-max p-3 pt-2 sm:p-4 sm:pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {expandable && <th className="w-8 py-3 px-2" aria-label="Expand" />}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "py-3 px-2 font-medium text-muted-foreground whitespace-nowrap",
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {showSkeleton && (
                <SkeletonRows
                  columns={
                    expandable
                      ? [{ key: "__expand", header: "", render: () => null }, ...visibleColumns]
                      : visibleColumns
                  }
                  count={resolvedSkeletonRows}
                />
              )}

              {showError && (
                <ErrorStateRow colSpan={effectiveColSpan} message={error!} onRetry={onRetry} />
              )}

              {showEmpty && (
                <EmptyStateRow
                  colSpan={effectiveColSpan}
                  message={emptyMessage}
                  emptyState={emptyState}
                />
              )}

              {showData &&
                paged.map((row) => {
                  const key = keyExtractor(row);
                  const isExpanded = expandedRows.has(key);

                  return (
                    <React.Fragment key={key}>
                      <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        {expandable && (
                          <td className="w-8 py-3 px-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(key)}
                              className="flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              aria-expanded={isExpanded}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                          </td>
                        )}
                        {visibleColumns.map((col) => (
                          <td
                            key={col.key}
                            className={cn(
                              "py-3 px-2",
                              col.align === "right"
                                ? "text-right"
                                : col.align === "center"
                                  ? "text-center"
                                  : "text-left",
                            )}
                          >
                            {col.render(row)}
                          </td>
                        ))}
                      </tr>

                      {expandable && isExpanded && onExpandRow && (
                        <ExpandedRowContent
                          colSpan={effectiveColSpan}
                          rowKey={key}
                          cache={expandCache}
                          loader={() => onExpandRow(row)}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (
        <div className="border-t flex max-md:flex-col border-border px-3 py-3 sm:px-4">
          <div className="max-md:hidden flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-2">
              <span>Rows</span>
              <Select
                value={String(activePageSize)}
                onValueChange={(value) => {
                  const next = Number(value);
                  if (isManual) {
                    onPageSizeChange?.(next);
                    onPageChange?.(1);
                  } else {
                    setPageSizeState(next);
                    setPageState(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-right">
              {rangeStart}–{rangeEnd} of {totalItems}
            </span>
          </div>

          <div className="mt-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 sm:mt-3 sm:w-auto sm:min-w-[320px] sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = Math.max(1, safePage - 1);
                isManual ? onPageChange?.(next) : setPageState(next);
              }}
              disabled={safePage <= 1}
              className="h-8 justify-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="px-1 text-center text-sm font-medium text-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = Math.min(totalPages, safePage + 1);
                isManual ? onPageChange?.(next) : setPageState(next);
              }}
              disabled={safePage >= totalPages}
              className="h-8 justify-center gap-1 text-muted-foreground hover:text-foreground"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
