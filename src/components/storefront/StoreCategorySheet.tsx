import { Link } from "react-router-dom";
import {
  ArrowRight,
  Beef,
  Bird,
  ChefHat,
  Egg,
  Fish,
  Shell,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import { SHOP_CATEGORIES, SHOP_DROPDOWN_LINKS } from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet opened by the "Shop" tab of `StoreBottomNav`.
 *
 * Open/close state lives in `StoreNavbar`'s `drawerView`, so this sheet reuses
 * that component's backdrop, body-scroll lock, Escape handling and
 * close-on-navigation — nothing is duplicated here.
 */

/** Category photography in R2 is still placeholder (404s), so tiles use icons. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  chicken: Bird,
  mutton: Beef,
  fish: Fish,
  seafood: Shell,
  "ready-to-cook": ChefHat,
  eggs: Egg,
};

/** "All products" is the sheet's footer CTA — don't repeat it as a chip. */
const QUICK_LINKS = SHOP_DROPDOWN_LINKS.filter((link) => link.to !== "/collection");

type StoreCategorySheetProps = {
  open: boolean;
  /** Dismiss the sheet — also fired after following any link inside it. */
  onClose: () => void;
};

export function StoreCategorySheet({ open, onClose }: StoreCategorySheetProps) {
  return (
    <aside
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col overflow-hidden rounded-t-2xl bg-white",
        "shadow-[0_-10px_44px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-[var(--store-ease-premium)]",
        open ? "translate-y-0" : "translate-y-full",
      )}
      inert={!open}
      aria-label="Shop categories"
    >
      <button
        type="button"
        onClick={onClose}
        className="flex shrink-0 cursor-pointer justify-center pb-1 pt-3"
        aria-label="Close shop categories"
        tabIndex={-1}
      >
        <span className="h-1 w-10 rounded-full bg-black/15" aria-hidden />
      </button>

      <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-1">
        <div>
          <p className="store-text-eyebrow">Browse</p>
          <h2 className="mt-1 font-store-body text-base font-black uppercase tracking-tight text-[var(--store-ink)]">
            Shop by category
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]"
          aria-label="Close shop categories"
        >
          <X className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>

      <div
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
      >
        <ul className="grid grid-cols-3 gap-2.5">
          {SHOP_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.categorySlug] ?? Tag;
            return (
              <li key={category.id}>
                <Link
                  to={category.to}
                  onClick={onClose}
                  className={cn(
                    "flex h-[104px] flex-col items-center justify-center gap-2 rounded-xl border border-black/8",
                    "bg-[var(--store-cream)] px-1.5 transition-[border-color,box-shadow,transform] duration-200",
                    "hover:border-[var(--store-red)]/40 hover:shadow-[var(--store-shadow-sm)] active:scale-[0.97]",
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--store-red)] shadow-[var(--store-shadow-sm)]">
                    <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="text-center font-store-body text-[11px] font-semibold leading-tight tracking-wide text-[var(--store-ink)]">
                    {category.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="store-text-eyebrow pb-2 pt-5">Quick picks</p>
        <ul className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={onClose}
                className={cn(
                  "block rounded-full border border-black/10 px-4 py-2 font-store-body text-xs font-medium",
                  "tracking-wide text-[var(--store-muted)] transition-colors",
                  "hover:border-[var(--store-red)]/40 hover:text-[var(--store-red)]",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="store-sheet-safe-pb shrink-0 border-t border-black/8 px-5 pt-3.5">
        <Link
          to="/collection"
          onClick={onClose}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md bg-[var(--store-red-dark)] py-3.5",
            "font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-white",
            "shadow-[var(--store-shadow-sm)] transition-colors duration-300 hover:bg-[var(--store-red)]",
          )}
        >
          Shop all products
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
