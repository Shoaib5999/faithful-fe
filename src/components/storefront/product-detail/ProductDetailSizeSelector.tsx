import { storeFieldLabelClass } from "@/components/storefront/storefront-ui";
import type { ProductDetailVariant } from "@/lib/store-product-detail";
import { formatInr } from "@/lib/store-product-detail";
import { cn } from "@/lib/utils";

type ProductDetailSizeSelectorProps = {
  variants: ProductDetailVariant[];
  activeVariantId: string;
  onSelect: (id: string) => void;
};

export function ProductDetailSizeSelector({
  variants,
  activeVariantId,
  onSelect,
}: ProductDetailSizeSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="mt-5">
      <p className={storeFieldLabelClass}>Size</p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isActive = v.id === activeVariantId;
          const isDisabled = !v.isAvailable;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(v.id)}
              className={cn(
                "min-w-[7rem] rounded-md border px-4 py-2.5 text-left shadow-[var(--store-shadow-sm)] transition-[border-color,background-color,box-shadow]",
                isActive
                  ? "border-[var(--store-red)] bg-[var(--store-cream)] shadow-[var(--store-shadow-md)]"
                  : "border-black/10 bg-white hover:border-[var(--store-red)]/50",
                isDisabled && "cursor-not-allowed opacity-45",
              )}
            >
              <span className="block font-store-body text-sm font-bold text-[var(--store-ink)]">
                {v.label}
              </span>
              <span className="mt-0.5 block font-store-body text-[11px] text-[var(--store-muted)]">
                {isDisabled ? "Sold out" : `Only ${formatInr(v.price)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
