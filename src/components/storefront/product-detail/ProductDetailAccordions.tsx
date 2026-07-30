import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  PDP_ACCORDION_IDS,
  PDP_ACCORDION_LABELS,
  buildPdpDetailsBody,
  type PdpAccordionId,
} from "@/constants/product-detail.constants";
import type { StoreProductDetail } from "@/lib/store-product-detail";
import type { ProductDetailVariant } from "@/lib/store-product-detail";
import { cn } from "@/lib/utils";

type ProductDetailAccordionsProps = {
  product: StoreProductDetail;
  variant: ProductDetailVariant;
};

export function ProductDetailAccordions({ product, variant }: ProductDetailAccordionsProps) {
  const sectionBodies = useMemo(() => {
    const details = buildPdpDetailsBody({
      categoryLabel: product.categoryLabel,
      cutInfo: product.cutInfo,
      origin: product.origin,
      sku: variant.sku,
    });

    return {
      description: product.description.trim(),
      details: details.trim(),
      storage: product.storageInstructions.trim(),
      "cooking-tips": product.cookingTips.trim(),
    } satisfies Record<PdpAccordionId, string>;
  }, [product, variant.sku]);

  const isSectionVisible = (id: PdpAccordionId, body: string) => body.length > 0;

  const visibleSections = PDP_ACCORDION_IDS.filter((id) =>
    isSectionVisible(id, sectionBodies[id]),
  );
  const [openId, setOpenId] = useState<PdpAccordionId | null>(
    visibleSections[0] ?? null,
  );

  if (visibleSections.length === 0) return null;

  return (
    <section className="mt-6 border-t border-black/8">
      {visibleSections.map((id) => {
        const isOpen = openId === id;
        const body = sectionBodies[id];

        return (
          <div key={id} className="border-b border-black/10">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : id)}
              className="flex w-full items-center justify-between py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1a1a]">
                {PDP_ACCORDION_LABELS[id]}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--store-red)] transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && body.length > 0 && (
              <div className="pb-4">
                <div className="font-store-body text-sm leading-relaxed text-[#4a4a4a] whitespace-pre-line">
                  {body}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
