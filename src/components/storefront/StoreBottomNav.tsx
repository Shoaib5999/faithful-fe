import { Link } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingBag, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * App-style bottom tab bar for the storefront on phones and tablets.
 *
 * Presentational only — every panel it opens (search, the categories sheet, the
 * cart drawer, the auth modal) is owned by `StoreNavbar`, so the top bar and the
 * bottom bar can never disagree about what is open.
 *
 * Sits at z-30, i.e. *below* the navbar backdrop (z-40) and every drawer, so an
 * open panel dims it rather than punching through it.
 */

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--store-red)] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--store-ink)]"
      aria-hidden
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

type BottomNavItemProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  /** Renders a `Link` when set, a `button` otherwise. */
  to?: string;
  onClick?: () => void;
  badge?: number;
  ariaLabel?: string;
  ariaExpanded?: boolean;
};

function BottomNavItem({
  icon: Icon,
  label,
  active,
  to,
  onClick,
  badge,
  ariaLabel,
  ariaExpanded,
}: BottomNavItemProps) {
  const itemClass = cn(
    "relative flex h-full min-w-0 flex-1 select-none flex-col items-center justify-center gap-[5px]",
    "px-0.5 outline-none transition-[color,transform] duration-200 ease-[var(--store-ease-out)]",
    "focus-visible:bg-white/10 active:scale-[0.94]",
    active ? "text-[var(--store-red-light)]" : "text-white/70",
  );

  const inner = (
    <>
      <span
        className={cn(
          "absolute left-1/2 top-0 h-[2px] -translate-x-1/2 rounded-full bg-[var(--store-red-light)]",
          "transition-[width,opacity] duration-300 ease-[var(--store-ease-out)]",
          active ? "w-9 opacity-100" : "w-0 opacity-0",
        )}
        aria-hidden
      />
      <span className="relative flex items-center justify-center">
        <Icon
          className={cn(
            "h-[19px] w-[19px] transition-transform duration-300 ease-[var(--store-ease-out)]",
            active && "-translate-y-px scale-110",
          )}
          strokeWidth={active ? 2 : 1.6}
          aria-hidden
        />
        {typeof badge === "number" ? <NavBadge count={badge} /> : null}
      </span>
      <span className="font-store-body text-[10px] font-semibold uppercase tracking-[0.08em]">
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={itemClass}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={itemClass}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
    >
      {inner}
    </button>
  );
}

type StoreBottomNavProps = {
  cartCount: number;
  isLoggedIn: boolean;
  homeActive: boolean;
  shopActive: boolean;
  accountActive: boolean;
  categoriesOpen: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  onHomeClick: () => void;
  onCategoriesToggle: () => void;
  onSearchToggle: () => void;
  onCartToggle: () => void;
  onProfileClick: () => void;
};

export function StoreBottomNav({
  cartCount,
  isLoggedIn,
  homeActive,
  shopActive,
  accountActive,
  categoriesOpen,
  cartOpen,
  searchOpen,
  onHomeClick,
  onCategoriesToggle,
  onSearchToggle,
  onCartToggle,
  onProfileClick,
}: StoreBottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="store-bottom-nav-safe fixed inset-x-0 bottom-0 z-30 bg-[var(--store-ink)] shadow-[0_-6px_28px_rgba(0,0,0,0.35)] lg:hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--store-red)]/35" aria-hidden />

      <div className="flex h-14 items-stretch">
        <BottomNavItem icon={Home} label="Home" to="/" active={homeActive} onClick={onHomeClick} />

        <BottomNavItem
          icon={LayoutGrid}
          label="Shop"
          active={shopActive || categoriesOpen}
          onClick={onCategoriesToggle}
          ariaLabel={categoriesOpen ? "Close shop categories" : "Browse shop categories"}
          ariaExpanded={categoriesOpen}
        />

        <BottomNavItem
          icon={Search}
          label="Search"
          active={searchOpen}
          onClick={onSearchToggle}
          ariaLabel={searchOpen ? "Close search" : "Search products"}
          ariaExpanded={searchOpen}
        />

        <BottomNavItem
          icon={ShoppingBag}
          label="Cart"
          active={cartOpen}
          badge={cartCount}
          onClick={onCartToggle}
          ariaLabel={
            cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Cart, empty"
          }
          ariaExpanded={cartOpen}
        />

        <BottomNavItem
          icon={User}
          label={isLoggedIn ? "Account" : "Sign in"}
          active={accountActive}
          onClick={onProfileClick}
          ariaLabel={isLoggedIn ? "My account" : "Log in or sign up"}
        />
      </div>
    </nav>
  );
}
