import { storeFieldLabelClass } from "@/components/storefront/storefront-ui";
import { formatInr } from "@/lib/store-product-detail";
import { cn } from "@/lib/utils";

type ProductDetailPricingProps = {
  salePrice: number;
  mrp: number;
  savingsAmount: number;
  discount: number;
};

export function ProductDetailPricing({
  salePrice,
  mrp,
  savingsAmount,
  discount,
}: ProductDetailPricingProps) {
  return (
    <div className="mt-5 border-t border-black/10 pt-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-store-body text-2xl font-bold text-[var(--store-ink)] md:text-[1.75rem]">
          {formatInr(salePrice)}
        </span>
        {mrp > salePrice && (
          <span className="font-store-body text-base text-[var(--store-muted)] line-through">
            {formatInr(mrp)}
          </span>
        )}
        {savingsAmount > 0 && (
          <span className="rounded-sm bg-[#2d8a4e] px-2 py-0.5 font-store-body text-xs font-semibold text-white">
            Save {formatInr(savingsAmount)}
          </span>
        )}
        {discount > 0 && savingsAmount <= 0 && (
          <span className="rounded-sm bg-[#2d8a4e] px-2 py-0.5 font-store-body text-xs font-semibold text-white">
            {discount}% off
          </span>
        )}
      </div>
    </div>
  );
}
