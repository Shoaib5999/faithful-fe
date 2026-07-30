import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { storeFieldLabelClass } from "@/components/storefront/storefront-ui";

type ProductDetailMeatInfoProps = {
  origin: string;
  freshnessTags: string[];
};

export function ProductDetailMeatInfo({ origin, freshnessTags }: ProductDetailMeatInfoProps) {
  if (!origin && freshnessTags.length === 0) return null;

  return (
    <section className="mt-8 border-t border-black/10 pt-7">
      <RevealTitle as="h2" className={storeFieldLabelClass}>
        Freshness &amp; Sourcing
      </RevealTitle>

      {origin && (
        <p className="mt-3 font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
          {origin}
        </p>
      )}

      {freshnessTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {freshnessTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--store-red)]/25 bg-[var(--store-red)]/8 px-3 py-1 font-store-body text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--store-red-dark)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
