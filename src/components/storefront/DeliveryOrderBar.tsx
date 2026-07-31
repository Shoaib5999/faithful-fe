import { Phone, Truck } from "lucide-react";
import { STORE_LOCATION } from "@/constants/storefront.constants";

export function DeliveryOrderBar() {
  return (
    <section className="w-full bg-[var(--store-ink)] py-4" aria-label="Delivery and order info">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-red)] text-white">
            <Truck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="font-store-body">
            <span className="block text-sm font-bold uppercase tracking-[0.04em] text-white">
              Free Home Delivery
            </span>
            <span className="block text-xs text-white/60">
              No Minimum Order &nbsp;|&nbsp; Safe &amp; Contactless Delivery
            </span>
          </p>
        </div>

        <a
          href={`tel:${STORE_LOCATION.phoneTel}`}
          className="flex items-center gap-3 rounded-md border border-white/15 px-4 py-2 transition-colors duration-200 hover:border-white/30"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-red)] text-white">
            <Phone className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="font-store-body">
            <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
              Order Now
            </span>
            <span className="block text-base font-bold tracking-wide text-white">
              {STORE_LOCATION.phoneDisplay}
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
