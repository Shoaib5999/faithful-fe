import { Minus, Plus } from "lucide-react";
import {
  StoreGhostButton,
  StorePrimaryButton,
  storeFieldLabelClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

type ProductDetailPurchaseActionsProps = {
  qty: number;
  maxQty?: number;
  onQtyChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
};

export function ProductDetailPurchaseActions({
  qty,
  maxQty = 99,
  onQtyChange,
  onAddToCart,
  onBuyNow,
  disabled,
}: ProductDetailPurchaseActionsProps) {
  return (
    <div className="mt-5">
      <p className={storeFieldLabelClass}>Quantity</p>
      <div
        className={cn(
          storePanelClass,
          "mt-3 inline-flex items-center overflow-hidden p-0",
        )}
      >
        <button
          type="button"
          onClick={() => onQtyChange(Math.max(1, qty - 1))}
          className="cursor-pointer px-4 py-2.5 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[2.75rem] border-x border-black/10 px-3 py-2.5 text-center font-store-body text-sm font-semibold text-[var(--store-ink)]">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
          disabled={qty >= maxQty}
          className="cursor-pointer px-4 py-2.5 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-2.5">
        <StorePrimaryButton
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
          className="w-full py-3.5 text-xs font-bold tracking-[0.14em]"
        >
          Buy it now
        </StorePrimaryButton>

        <StoreGhostButton
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
          className="w-full py-3.5 text-xs font-bold tracking-[0.14em]"
        >
          Add to cart
        </StoreGhostButton>
      </div>
    </div>
  );
}
