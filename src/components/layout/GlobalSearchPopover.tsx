import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { EmptyState } from "@/components/common/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useModal } from "@/hooks/useModal";
import { ROUTES } from "@/constants/routes.constants";
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  GalleryHorizontal,
  Star,
  Command,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobalSearchAction } from "@/types/global-search.types";

const SEARCH_DEBOUNCE_MS = 300;

interface ResultItem {
  id: string;
  icon: React.ElementType;
  primary: string;
  secondary: string;
  action: GlobalSearchAction;
}

const GroupLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className="block px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
    {label}
  </span>
);

export const GlobalSearchPopover: React.FC<{ className?: string }> = ({ className }) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { isFetching, ...results } = useGlobalSearch(debouncedQuery);

  const isDebouncing = query.trim() !== debouncedQuery.trim();
  const isSearching = isDebouncing || isFetching;
  const hasQuery = debouncedQuery.trim().length > 0;

  const flatItems = useMemo((): ResultItem[] => {
    const items: ResultItem[] = [];

    results.navigation.forEach((nav) =>
      items.push({
        id: nav.id,
        icon: LayoutDashboard,
        primary: nav.label,
        secondary: `Open ${nav.label}`,
        action: {
          type: "navigate",
          path: nav.path,
          state:
            nav.path === ROUTES.coupons
              ? { couponSearch: debouncedQuery.trim() }
              : undefined,
        },
      }),
    );

    results.coupons.forEach((c) =>
      items.push({
        id: c.id,
        icon: Ticket,
        primary: c.code,
        secondary: c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`,
        action: {
          type: "navigate",
          path: ROUTES.coupons,
          state: { openCoupon: c },
        },
      }),
    );

    results.products.forEach((p) =>
      items.push({
        id: p.id,
        icon: Package,
        primary: p.name,
        secondary: p.sku || p.variants[0]?.sku || "",
        action: { type: "modal", modalKey: "ProductCreateEdit", payload: { product: p } },
      }),
    );
    results.orders.forEach((o) =>
      items.push({
        id: o.id,
        icon: ShoppingCart,
        primary: o.orderNumber,
        secondary: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
        action: { type: "modal", modalKey: "OrderDetail", payload: { order: o } },
      }),
    );
    results.customers.forEach((c) =>
      items.push({
        id: c.id,
        icon: Users,
        primary: `${c.firstName} ${c.lastName}`.trim(),
        secondary: c.email ?? c.phone ?? "",
        action: { type: "modal", modalKey: "CustomerProfile", payload: { customer: c } },
      }),
    );
    results.sliders.forEach((s) =>
      items.push({
        id: s.id,
        icon: GalleryHorizontal,
        primary: s.title,
        secondary: s.subtitle ?? "",
        action: { type: "navigate", path: ROUTES.cms },
      }),
    );
    results.reviews.forEach((r) =>
      items.push({
        id: r.id,
        icon: Star,
        primary: r.title || r.productName,
        secondary: r.productName,
        action: { type: "modal", modalKey: "ReviewAction", payload: { review: r } },
      }),
    );
    return items;
  }, [results, debouncedQuery]);

  useEffect(() => {
    setActiveIndex(flatItems.length > 0 ? 0 : -1);
  }, [flatItems]);

  useEffect(() => {
    setOpen(hasQuery);
  }, [hasQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        if (query.trim()) setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  const handleSelect = useCallback(
    (item: ResultItem) => {
      if (item.action.type === "navigate") {
        navigate(item.action.path, { state: item.action.state });
      } else {
        openModal(item.action.modalKey, item.action.payload);
      }
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [navigate, openModal],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
        return;
      }

      if (!open || flatItems.length === 0 || isSearching) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % flatItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < flatItems.length) {
            handleSelect(flatItems[activeIndex]);
          }
          break;
      }
    },
    [open, flatItems, activeIndex, handleSelect, isSearching],
  );

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-search-item]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const hasResults = results.totalCount > 0;

  let flatIdx = 0;
  const renderGroup = (label: string, items: ResultItem[]) => {
    if (items.length === 0) return null;
    const groupItems = items.map((item) => {
      const idx = flatIdx++;
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          type="button"
          data-search-item
          onClick={() => handleSelect(item)}
          onMouseEnter={() => setActiveIndex(idx)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
            idx === activeIndex ? "bg-secondary" : "hover:bg-secondary/50",
          )}
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{item.primary}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.secondary}</span>
          </div>
        </button>
      );
    });
    return (
      <React.Fragment key={label}>
        <GroupLabel label={label} />
        {groupItems}
      </React.Fragment>
    );
  };

  const groups = [
    { label: "Pages", items: flatItems.filter((i) => i.icon === LayoutDashboard) },
    { label: "Coupons", items: flatItems.filter((i) => i.icon === Ticket) },
    { label: "Products", items: flatItems.filter((i) => i.icon === Package) },
    { label: "Orders", items: flatItems.filter((i) => i.icon === ShoppingCart) },
    { label: "Customers", items: flatItems.filter((i) => i.icon === Users) },
    { label: "CMS Sliders", items: flatItems.filter((i) => i.icon === GalleryHorizontal) },
    { label: "Reviews", items: flatItems.filter((i) => i.icon === Star) },
  ];

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && !query.trim()) return;
      }}
    >
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            placeholder="Search everything..."
            className="pl-9 pr-16"
            aria-expanded={open}
            aria-controls="global-search-results"
            autoComplete="off"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />F
          </span>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id="global-search-results"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div ref={listRef} className="max-h-[70vh] overflow-y-auto p-1">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : !hasResults && hasQuery ? (
            <div className="py-8">
              <EmptyState
                icon={Search}
                title="No results found"
                description={`Nothing matched "${debouncedQuery.trim()}". Try another keyword.`}
              />
            </div>
          ) : (
            (() => {
              flatIdx = 0;
              return groups.map((g) => renderGroup(g.label, g.items));
            })()
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
