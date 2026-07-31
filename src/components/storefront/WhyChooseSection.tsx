import { Bike, Leaf, PocketKnife, ShieldCheck } from "lucide-react";

const REASONS = [
  {
    icon: Leaf,
    title: "100% Fresh Meat",
    body: "We deliver only the freshest meat & fish.",
  },
  {
    icon: PocketKnife,
    title: "Hygienic Cutting",
    body: "Cut & packed in a clean & hygienic environment.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Checked",
    body: "Every product goes through strict quality checks.",
  },
  {
    icon: Bike,
    title: "Fast & Safe Delivery",
    body: "On-time delivery to your doorstep.",
  },
] as const;

export function WhyChooseSection() {
  return (
    <section
      className="w-full bg-[var(--store-ink)] py-14 md:py-18"
      aria-labelledby="why-choose-heading"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-16">
        <h2
          id="why-choose-heading"
          className="mb-10 text-center font-store-body text-[clamp(1.25rem,3vw,2rem)] font-black uppercase tracking-tight text-white md:mb-14"
        >
          Why Choose <span className="text-[var(--store-red)]">Faithful Meat</span>?
        </h2>

        <ul className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--store-red)] text-[var(--store-red)]">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-store-body text-xs font-bold uppercase tracking-[0.06em] text-white sm:text-sm">
                {title}
              </h3>
              <p className="mt-2 font-store-body text-xs leading-relaxed text-white/60">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
