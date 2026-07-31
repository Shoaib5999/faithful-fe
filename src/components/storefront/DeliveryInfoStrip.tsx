import { Clock, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Free Home Delivery",
    subtitle: "No Minimum Order",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Contactless Delivery",
    subtitle: "Your Safety, Our Priority",
  },
  {
    icon: Clock,
    title: "On Time Delivery",
    subtitle: "Right Time, Every Time",
  },
] as const;

export function DeliveryInfoStrip() {
  return (
    <section className="w-full border-y border-black/5 bg-white" aria-label="Delivery promise">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-black/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 md:px-12 lg:px-16">
        {ITEMS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center justify-center gap-3 py-5 sm:py-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-red-pale)] text-[var(--store-red)]">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block font-store-body text-sm font-bold uppercase tracking-[0.02em] text-[var(--store-ink)]">
                {title}
              </span>
              <span className="block font-store-body text-xs text-[var(--store-muted)]">
                {subtitle}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
