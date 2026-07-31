import { Link } from "react-router-dom";
import { PocketKnife } from "lucide-react";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { StoreImageWithFallback } from "@/components/storefront/storefront-ui";

const CUTS = [
  { id: "small", label: "Small Cut", image: CATEGORY_R2_IMAGES.mutton },
  { id: "medium", label: "Medium Cut", image: CATEGORY_R2_IMAGES.mutton },
  { id: "large", label: "Large Cut", image: CATEGORY_R2_IMAGES.mutton },
  { id: "biryani", label: "Biryani Cut", image: CATEGORY_R2_IMAGES.chicken },
  { id: "curry", label: "Curry Cut", image: CATEGORY_R2_IMAGES.chicken },
  { id: "boneless", label: "Boneless Cut", image: CATEGORY_R2_IMAGES.chicken },
] as const;

export function SpecialCutsSection() {
  return (
    <section
      className="w-full bg-[var(--store-red)] py-14 md:py-18"
      aria-labelledby="special-cuts-heading"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-16">
        <h2
          id="special-cuts-heading"
          className="mb-8 text-center font-store-body text-[clamp(1.25rem,3vw,2rem)] font-black uppercase tracking-tight text-white md:mb-10"
        >
          Special Cuts &ndash; As Per Your Need
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
          {CUTS.map((cut) => (
            <div
              key={cut.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/15"
            >
              <StoreImageWithFallback
                src={cut.image}
                alt={cut.label}
                icon={PocketKnife}
                className="transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-2.5 text-center font-store-body text-[11px] font-bold uppercase tracking-[0.04em] text-white sm:text-xs">
                {cut.label}
              </span>
            </div>
          ))}

          <div className="col-span-2 flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-5 text-center sm:col-span-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--store-red-pale)] text-[var(--store-red)]">
              <PocketKnife className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="font-store-body text-xs font-bold uppercase tracking-[0.04em] text-[var(--store-ink)]">
              Custom Cuts
            </p>
            <p className="font-store-body text-[11px] leading-snug text-[var(--store-muted)]">
              Available as per your requirement
            </p>
            <Link
              to="/contact"
              className="mt-1 inline-flex items-center justify-center rounded-md bg-[var(--store-ink)] px-5 py-2 font-store-body text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-black"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
