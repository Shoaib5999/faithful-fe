import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { CartLineQtyControl } from "@/components/storefront/CartLineQtyControl";
import { StorePrimaryButton } from "@/components/storefront/storefront-ui";
import type { CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";

type StoreCartDrawerProps = {
  open: boolean;
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  onClose: () => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onRemoveItem: (id: string) => void;
  onSetItemQty: (id: string, qty: number) => void;
};

export function StoreCartDrawer({
  open,
  items,
  cartCount,
  subtotal,
  onClose,
  onCheckout,
  onContinueShopping,
  onRemoveItem,
  onSetItemQty,
}: StoreCartDrawerProps) {
  return (
    <aside
      className={cn(
        "bg-background fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[400px] flex-col shadow-[var(--store-shadow-lg)] transition-transform duration-300 ease-[var(--store-ease-premium)]",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
      aria-label="Shopping cart"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-black/8 px-6 py-5">
        <p className="font-store-body text-sm font-semibold uppercase tracking-[0.14em] text-[var(--store-ink)]">
          Your bag {cartCount > 0 && <span className="text-[var(--store-red)]">· {cartCount}</span>}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-red)]"
          aria-label="Close cart"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--store-cream)]">
            <ShoppingBag className="h-10 w-10 text-[var(--store-muted)]" strokeWidth={1} />
          </div>
          <p className="mt-5  text-xl text-[var(--store-ink)]">Your cart is empty</p>
          <p className="mt-2 max-w-xs font-store-body text-sm text-[var(--store-muted)]">
            Discover fresh chicken, mutton, fish, and more.
          </p>
          <StorePrimaryButton type="button" onClick={onContinueShopping} className="mt-8 px-10">
            Continue shopping
          </StorePrimaryButton>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <ul
            data-lenis-prevent
           className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 md:pl-4 md:pr-1 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((it) => {
              const unitPrice = Number(String(it.price).replace(/[^\d.]/g, "")) || 0;
              const lineTotal = unitPrice * it.qty;

              return (
                <li
                  key={it.id}
                  className="flex gap-4 rounded-lg border border-black/5 bg-white p-3 shadow-[var(--store-shadow-sm)]"
                >
                  <div className="store-img-zoom h-24 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--store-cream)]">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-store-body text-sm font-semibold text-[var(--store-ink)]">
                      {it.name}
                    </p>
                    {it.notes && (
                      <p className="mt-0.5 truncate font-store-body text-[11px] uppercase tracking-wide text-[var(--store-muted)]">
                        {it.notes}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <CartLineQtyControl
                        qty={it.qty}
                        maxQty={it.stockQty ?? 99}
                        onQtyChange={(nextQty) => void onSetItemQty(it.id, nextQty)}
                      />
                      <button
                        type="button"
                        onClick={() => void onRemoveItem(it.id)}
                        className="inline-flex items-center gap-1 font-store-body text-[11px] font-semibold uppercase tracking-wide text-[var(--store-muted)] transition-colors hover:text-red-600"
                        aria-label={`Remove ${it.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 font-store-body text-sm font-semibold text-[var(--store-ink)]">
                      ₹ {lineTotal.toLocaleString("en-IN")}
                      {it.qty > 1 && (
                        <span className="ml-1 text-[11px] font-normal text-[var(--store-muted)]">
                          ({it.price} each)
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="shrink-0 border-t border-black/10 bg-white px-6 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="font-store-body text-xs uppercase tracking-[0.14em] text-[var(--store-muted)]">
                Subtotal
              </span>
              <span className="font-store-body text-lg font-semibold text-[var(--store-ink)]">
                ₹ {subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-1 font-store-body text-[11px] text-[var(--store-muted)]">
              Shipping & taxes calculated at checkout
            </p>
            <StorePrimaryButton type="button" onClick={onCheckout} className="mt-4 w-full py-3.5">
              Checkout
            </StorePrimaryButton>
            <Link
              to="/collection"
              onClick={onClose}
              className="mt-3 block text-center font-store-body text-xs uppercase tracking-[0.12em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-red)]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
