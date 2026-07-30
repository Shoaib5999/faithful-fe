import { Leaf, Truck, ShieldCheck } from "lucide-react";
import { PDP_TRUST_PILLARS } from "@/constants/product-detail.constants";

const PILLAR_ICONS = {
  fresh: Leaf,
  "fast-delivery": Truck,
  "secure-payment": ShieldCheck,
} as const;

export function ProductDetailTrustPillars() {
  return (
    <div className="mt-8 border-t border-black/10 pt-8">
      <ul
        className="mx-auto grid max-w-xl grid-cols-3 gap-x-4 gap-y-4 sm:max-w-2xl sm:gap-x-10 lg:max-w-3xl lg:gap-x-14"
      >
        {PDP_TRUST_PILLARS.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS] ?? Leaf;
          return (
            <li key={pillar.id} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--store-cream)] sm:h-14 sm:w-14 lg:h-[4.25rem] lg:w-[4.25rem]">
                <Icon className="h-5 w-5 text-[var(--store-red)] sm:h-6 sm:w-6" strokeWidth={1.25} />
              </div>
              <p className="mt-2.5 px-1 font-store-body text-[10px] font-semibold leading-snug text-[var(--store-ink)] sm:mt-3 sm:text-xs">
                {pillar.label}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
