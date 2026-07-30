import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { CollectionPriceRangeSlider } from "@/components/storefront/CollectionPriceRangeSlider";
import {
  ArrowUpDown,
  IndianRupee,
  LayoutGrid,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  COLLECTION_SORT_OPTIONS,
  type CollectionSortId,
} from "@/constants/storefront.constants";
import type { CollectionQuickFilterId } from "@/services/storefront-product-service";
import type { Brand, Category } from "@/types/master.types";
import { cn } from "@/lib/utils";

const SCROLLBAR_HIDE =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const getLenis = () => window.__lenis ?? null;

const lockBodyScroll = () => {
  getLenis()?.stop();
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  return scrollY;
};

const unlockBodyScroll = (scrollY: number) => {
  getLenis()?.start();
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  window.scrollTo(0, scrollY);
};

const QUICK_FILTERS: Array<{ id: CollectionQuickFilterId; label: string }> = [
  { id: "best-sellers", label: "Bestsellers" },
  { id: "new-arrivals", label: "New Arrivals" },
];

type FilterSectionId =
  | "sort"
  | "highlights"
  | "categories"
  | "brands"
  | "price";

const SECTION_ICONS: Record<FilterSectionId, LucideIcon> = {
  sort: ArrowUpDown,
  highlights: Sparkles,
  categories: LayoutGrid,
  brands: Tag,
  price: IndianRupee,
};

const SECTION_SHORT_LABELS: Record<FilterSectionId, string> = {
  sort: "Sort",
  highlights: "Featured",
  categories: "Category",
  brands: "Brand",
  price: "Price",
};

type FilterSection = {
  id: FilterSectionId;
  label: string;
  count: number;
};

export type CollectionFilterDraft = {
  sort: CollectionSortId;
  quickFilters: CollectionQuickFilterId[];
  categorySlug: string | null;
  brandSlug: string | null;
  priceMin: number | undefined;
  priceMax: number | undefined;
};

export type CollectionFilterOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: CollectionFilterDraft;
  onDraftChange: (draft: CollectionFilterDraft) => void;
  onApply: () => void;
  onClearAll: () => void;
  categoryOptions: Category[];
  brandOptions: Brand[];
  priceBounds: { min: number; max: number } | null;
};

type FilterTextOptionProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
};

function FilterTextOption({ label, selected, onClick, compact }: FilterTextOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-fit font-store-display text-left leading-tight transition-colors duration-200",
        compact ? "text-xl md:text-2xl" : "text-2xl md:text-[1.75rem] lg:text-3xl",
        selected
          ? "text-[var(--store-ink)] underline decoration-2 underline-offset-[0.28em] decoration-[var(--store-red)]"
          : "text-[var(--store-muted)] hover:text-[var(--store-ink)]/70",
      )}
    >
      {label}
    </button>
  );
}

type SectionNavButtonProps = {
  section: FilterSection;
  active: boolean;
  onClick: () => void;
  variant: "rail" | "pill";
};

function SectionNavButton({ section, active, onClick, variant }: SectionNavButtonProps) {
  const Icon = SECTION_ICONS[section.id];
  const shortLabel = SECTION_SHORT_LABELS[section.id];

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        aria-label={section.label}
        className={cn(
          "relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 transition-colors",
          active
            ? "bg-white text-[var(--store-ink)] shadow-[var(--store-shadow-sm)] ring-1 ring-[var(--store-red)]/40"
            : "text-[var(--store-muted)] hover:bg-white/60 hover:text-[var(--store-ink)]",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="font-store-body text-[9px] font-semibold uppercase tracking-[0.08em] leading-none">
          {shortLabel}
        </span>
        {section.count > 0 ? (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--store-red)]" aria-hidden />
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group relative w-full py-3 text-left font-store-body text-[0.625rem] font-semibold uppercase tracking-[0.28em] transition-colors",
        active ? "text-[var(--store-ink)]" : "text-[var(--store-muted)] hover:text-[var(--store-ink)]/70",
      )}
    >
      <span className="flex items-center gap-2">
        {section.label}
        {section.count > 0 ? (
          <span className="font-store-body text-[0.5625rem] tracking-normal text-[var(--store-red)]">
            {section.count}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-2 block h-px origin-left bg-[var(--store-red)] transition-transform duration-300",
          active ? "w-8 scale-x-100" : "w-8 scale-x-0 group-hover:scale-x-50",
        )}
        aria-hidden
      />
    </button>
  );
}

type FilterPanelProps = {
  title: string;
  children: ReactNode;
  dense?: boolean;
};

function FilterPanel({ title, children, dense }: FilterPanelProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <p
        className="shrink-0 font-store-body text-[0.625rem] font-semibold uppercase tracking-[0.4em] text-[var(--store-red-dark)]"
      >
        {title}
      </p>
      <div
        className={cn(
          "mt-4 min-h-0",
          dense
            ? "grid grid-cols-1 content-start gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:gap-y-3"
            : "flex flex-col justify-start gap-3 md:gap-3.5",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CollectionFilterOverlay({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
  onClearAll,
  categoryOptions,
  brandOptions,
  priceBounds,
}: CollectionFilterOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const applyRuleRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const [mounted, setMounted] = useState(open);
  const [activeSection, setActiveSection] = useState<FilterSectionId>("sort");
  const isClosingRef = useRef(false);
  const skipPanelTransitionRef = useRef(true);

  const patchDraft = useCallback(
    (patch: Partial<CollectionFilterDraft>) => {
      onDraftChange({ ...draft, ...patch });
    },
    [draft, onDraftChange],
  );

  const priceMin = draft.priceMin ?? priceBounds?.min ?? 0;
  const priceMax = draft.priceMax ?? priceBounds?.max ?? 0;

  const hasPriceFilter =
    priceBounds !== null &&
    (draft.priceMin !== undefined || draft.priceMax !== undefined);

  const sections = useMemo((): FilterSection[] => {
    const items: FilterSection[] = [
      {
        id: "sort",
        label: "Sort",
        count: draft.sort !== "newest" ? 1 : 0,
      },
      {
        id: "highlights",
        label: "Highlights",
        count: draft.quickFilters.length,
      },
    ];

    if (categoryOptions.length > 0) {
      items.push({
        id: "categories",
        label: "Categories",
        count: draft.categorySlug ? 1 : 0,
      });
    }

    if (brandOptions.length > 0) {
      items.push({
        id: "brands",
        label: "Brands",
        count: draft.brandSlug ? 1 : 0,
      });
    }

    if (priceBounds && priceBounds.max > priceBounds.min) {
      items.push({
        id: "price",
        label: "Price",
        count: hasPriceFilter ? 1 : 0,
      });
    }

    return items;
  }, [
    draft.sort,
    draft.quickFilters.length,
    draft.categorySlug,
    draft.brandSlug,
    hasPriceFilter,
    categoryOptions.length,
    brandOptions.length,
    priceBounds,
  ]);

  useEffect(() => {
    if (!sections.some((s) => s.id === activeSection)) {
      setActiveSection(sections[0]?.id ?? "sort");
    }
  }, [sections, activeSection]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setActiveSection("sort");
      skipPanelTransitionRef.current = true;
    }
  }, [open]);

  const animateIn = useCallback(() => {
    const overlay = overlayRef.current;
    const indexItems = indexRef.current?.querySelectorAll("[data-index-item]");
    const panel = panelRef.current;
    const rule = applyRuleRef.current;
    if (!overlay) return;

    gsap.killTweensOf([overlay, indexItems, panel, rule]);
    gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
    if (indexItems?.length) gsap.set(indexItems, { opacity: 0, x: -16 });
    if (panel) gsap.set(panel, { opacity: 0, x: 24 });

    const tl = gsap.timeline();
    tl.fromTo(
      overlay,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.85, ease: "power3.out" },
    );
    if (indexItems?.length) {
      tl.to(
        indexItems,
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" },
        "-=0.5",
      );
    }
    if (panel) {
      tl.to(panel, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");
    }
  }, []);

  const animatePanel = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);
    gsap.fromTo(
      panel,
      { opacity: 0, x: 18 },
      { opacity: 1, x: 0, duration: 0.38, ease: "power2.out" },
    );
  }, []);

  const animateOut = useCallback((onComplete?: () => void) => {
    const overlay = overlayRef.current;
    if (!overlay) {
      onComplete?.();
      return;
    }
    gsap.killTweensOf(overlay);
    gsap.to(overlay, {
      yPercent: -100,
      duration: 0.7,
      ease: "power3.in",
      onComplete,
    });
  }, []);

  const dismiss = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    animateOut(() => {
      isClosingRef.current = false;
      setMounted(false);
      onOpenChange(false);
    });
  }, [animateOut, onOpenChange]);

  const handleApply = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const rule = applyRuleRef.current;
    const overlay = overlayRef.current;
    if (!rule || !overlay) {
      onApply();
      isClosingRef.current = false;
      setMounted(false);
      onOpenChange(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onApply();
        isClosingRef.current = false;
        setMounted(false);
        onOpenChange(false);
        gsap.set(rule, { scaleX: 0 });
        gsap.set(overlay, { yPercent: -100 });
      },
    });
    tl.to(rule, {
      scaleX: 1,
      duration: 0.55,
      ease: "power2.inOut",
    }).to(
      overlay,
      { yPercent: -100, duration: 0.75, ease: "power3.in" },
      "+=0.12",
    );
  }, [onApply, onOpenChange]);

  useLayoutEffect(() => {
    if (!mounted || !open) return;
    animateIn();
    closeRef.current?.focus();
  }, [mounted, open, animateIn]);

  useLayoutEffect(() => {
    if (!mounted || !open) return;
    if (skipPanelTransitionRef.current) {
      skipPanelTransitionRef.current = false;
      return;
    }
    animatePanel();
  }, [activeSection, mounted, open, animatePanel]);

  useEffect(() => {
    if (!mounted) return;
    scrollYRef.current = lockBodyScroll();
    return () => {
      unlockBodyScroll(scrollYRef.current);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, dismiss]);

  const toggleQuickFilter = (id: CollectionQuickFilterId) => {
    const next = draft.quickFilters.includes(id) ? [] : [id];
    patchDraft({ quickFilters: next });
  };

  const handlePriceChange = (min: number, max: number) => {
    if (!priceBounds) return;
    const atFullRange = min <= priceBounds.min && max >= priceBounds.max;
    patchDraft({
      priceMin: atFullRange ? undefined : min,
      priceMax: atFullRange ? undefined : max,
    });
  };

  const handleSectionSelect = (id: FilterSectionId) => {
    setActiveSection(id);
  };

  const renderPanelContent = () => {
    switch (activeSection) {
      case "sort":
        return (
          <FilterPanel title="Sort" dense>
            {COLLECTION_SORT_OPTIONS.map((opt) => (
              <FilterTextOption
                key={opt.id}
                label={opt.label}
                selected={draft.sort === opt.id}
                onClick={() => patchDraft({ sort: opt.id })}
                compact
              />
            ))}
          </FilterPanel>
        );
      case "highlights":
        return (
          <FilterPanel title="Highlights">
            {QUICK_FILTERS.map((f) => (
              <FilterTextOption
                key={f.id}
                label={f.label}
                selected={draft.quickFilters.includes(f.id)}
                onClick={() => toggleQuickFilter(f.id)}
              />
            ))}
          </FilterPanel>
        );
      case "categories":
        return (
          <FilterPanel title="Categories" dense>
            {categoryOptions.map((c) => (
              <FilterTextOption
                key={c.id}
                label={c.name}
                selected={draft.categorySlug === c.slug}
                onClick={() =>
                  patchDraft({
                    categorySlug: draft.categorySlug === c.slug ? null : c.slug,
                  })
                }
                compact
              />
            ))}
          </FilterPanel>
        );
      case "brands":
        return (
          <FilterPanel title="Brands" dense>
            {brandOptions.map((b) => (
              <FilterTextOption
                key={b.id}
                label={b.name}
                selected={draft.brandSlug === b.slug}
                onClick={() =>
                  patchDraft({
                    brandSlug: draft.brandSlug === b.slug ? null : b.slug,
                  })
                }
                compact
              />
            ))}
          </FilterPanel>
        );
      case "price":
        return (
          <FilterPanel title="Price">
            {priceBounds && priceBounds.max > priceBounds.min ? (
              <CollectionPriceRangeSlider
                boundsMin={priceBounds.min}
                boundsMax={priceBounds.max}
                valueMin={priceMin}
                valueMax={priceMax}
                onChange={handlePriceChange}
              />
            ) : null}
          </FilterPanel>
        );
      default:
        return null;
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Filter and sort"
      className="storefront fixed inset-0 z-[300] flex h-[100dvh] flex-col overflow-hidden bg-[var(--store-cream)] text-[var(--store-ink)] will-change-transform"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-4 md:px-10 md:py-6">
        <p className="font-store-body text-[0.625rem] font-semibold uppercase tracking-[0.4em] text-[var(--store-muted)]">
          Refine
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="font-store-body text-xs uppercase tracking-[0.2em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
        >
          Close
        </button>
      </div>

      <div
        className={cn(
          "shrink-0 border-b border-black/10 px-4 pb-3 pt-1 md:hidden",
          SCROLLBAR_HIDE,
        )}
      >
        <div className="grid grid-cols-4 gap-1.5">
          {sections.map((section) => (
            <div key={section.id} className="relative">
              <SectionNavButton
                section={section}
                active={activeSection === section.id}
                onClick={() => handleSectionSelect(section.id)}
                variant="pill"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav
          ref={indexRef}
          aria-label="Filter sections"
          className="hidden w-44 shrink-0 flex-col justify-center border-r border-black/10 px-8 lg:w-52 lg:px-10 md:flex"
        >
          {sections.map((section) => (
            <div key={section.id} data-index-item>
              <SectionNavButton
                section={section}
                active={activeSection === section.id}
                onClick={() => handleSectionSelect(section.id)}
                variant="rail"
              />
            </div>
          ))}
        </nav>

        <div
          key={activeSection}
          ref={panelRef}
          data-filter-panel
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-4 md:px-10 md:py-4 lg:px-14 lg:py-6",
            SCROLLBAR_HIDE,
          )}
        >
          <div className={cn("mx-auto min-h-0 max-w-xl", SCROLLBAR_HIDE)}>
            {renderPanelContent()}
          </div>
        </div>
      </div>

      <div className="relative shrink-0 px-6 pb-6 pt-3 md:px-10 md:pb-8 lg:px-14">
        <div
          ref={applyRuleRef}
          className="pointer-events-none absolute left-0 top-0 h-px w-full origin-left bg-[var(--store-red)]"
          aria-hidden
        />
        <div className="mx-auto flex max-w-xl items-center justify-between gap-6">
          <button
            type="button"
            onClick={onClearAll}
            className="font-store-body text-xs uppercase tracking-[0.18em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="font-store-display text-xl text-[var(--store-ink)] transition-colors hover:text-[var(--store-red-dark)] md:text-2xl"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
