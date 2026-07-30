import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { MobileShopSidebarNav } from "@/components/storefront/MobileShopSidebarNav";
import { StorePrimaryButton } from "@/components/storefront/storefront-ui";
import { MAIN_NAV_LINKS, SHOP_CATEGORIES } from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

type StoreMobileMenuProps = {
  open: boolean;
  isLoggedIn: boolean;
  isActive: (to: string) => boolean;
  onClose: () => void;
  onOpenAuth: (view: "login" | "signup") => void;
  onLogout: () => void;
};

export function StoreMobileMenu({
  open,
  isLoggedIn,
  isActive,
  onClose,
  onOpenAuth,
  onLogout,
}: StoreMobileMenuProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[60] flex h-dvh max-h-dvh w-[min(320px,85vw)] flex-col overflow-hidden bg-white shadow-[var(--store-shadow-lg)] transition-transform duration-300 ease-[var(--store-ease-premium)]",
        open ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={!open}
      aria-label="Navigation menu"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-black/8 px-6 py-5">
        <Link
          to="/"
          onClick={onClose}
          className="font-display text-[1.35rem] font-normal leading-none tracking-[0.04em] text-[var(--store-ink)]"
        >
          Faithful Meat
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5"
      >
        <p className="px-3 pb-2 store-text-eyebrow">Menu</p>
        <ul className="space-y-0.5">
          {MAIN_NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                onClick={onClose}
                className={cn(
                  "block rounded-lg px-3 py-3 font-store-body text-sm tracking-wide transition-colors",
                  isActive(link.to)
                    ? "bg-[var(--store-cream)] font-medium text-[var(--store-red)]"
                    : "text-[var(--store-muted)] hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/wishlist"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-3 font-store-body text-sm tracking-wide transition-colors",
                isActive("/wishlist")
                  ? "bg-[var(--store-cream)] font-medium text-[var(--store-red)]"
                  : "text-[var(--store-muted)] hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]",
              )}
            >
              <Heart className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Wishlist
            </Link>
          </li>
        </ul>

        <div className="mt-6 border-t border-black/8 px-3 pt-5">
          <p className="store-text-eyebrow pb-3">Categories</p>
          <ul className="grid grid-cols-2 gap-2">
            {SHOP_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to={category.to}
                  onClick={onClose}
                  className="block rounded-lg border border-black/8 bg-[var(--store-cream)]/50 px-3 py-3 text-center font-store-body text-xs font-medium tracking-wide text-[var(--store-ink)] transition-colors hover:border-[var(--store-red)]/40 hover:text-[var(--store-red)]"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-black/8 px-3 pt-5">
          <p className="store-text-eyebrow pb-2">Shop</p>
          <MobileShopSidebarNav onNavigate={onClose} />
        </div>
      </nav>

      <div className="shrink-0 border-t border-black/8 bg-[var(--store-cream)]/40 px-6 py-5">
        <p className="store-text-eyebrow">Account</p>
        {isLoggedIn ? (
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to="/account"
              onClick={onClose}
              className="block w-full rounded-md border border-black/10 bg-white py-3 text-center font-store-body text-sm font-medium text-[var(--store-ink)] transition-colors hover:bg-white hover:shadow-[var(--store-shadow-sm)]"
            >
              My account
            </Link>
            <StorePrimaryButton
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3"
            >
              Sign out
            </StorePrimaryButton>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth("login")}
              className="w-full rounded-md border border-black/10 bg-white py-3 font-store-body text-sm font-medium text-[var(--store-ink)] transition-colors hover:shadow-[var(--store-shadow-sm)]"
            >
              Sign in
            </button>
            <StorePrimaryButton type="button" onClick={() => onOpenAuth("signup")} className="w-full py-3">
              Create account
            </StorePrimaryButton>
          </div>
        )}
      </div>
    </aside>
  );
}
