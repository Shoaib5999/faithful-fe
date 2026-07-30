import { Award, Leaf, MapPin } from "lucide-react";
import { TRUST_CREDENTIALS } from "@/constants/storefront.constants";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";

const ICONS = {
  "made-in-india": MapPin,
  fda: Award,
  natural: Leaf,
} as const;

export function TrustCredentialsBar() {
  return (
    <section
      className="store-editorial-section store-bg-cream w-full"
      aria-label="Quality credentials"
    >
      <div className="store-editorial-container">
        <div className="mb-12 max-w-xl">
          <RevealText className="store-text-eyebrow text-[var(--store-red)]">Why choose us</RevealText>
          <RevealTitle
            as="h2"
            className="mt-3  text-[clamp(1.75rem,4vw,3rem)] tracking-wide text-[var(--store-ink)]"
          >
            The promise of the house
          </RevealTitle>
        </div>

        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-10">
          {TRUST_CREDENTIALS.map((item) => {
            const Icon = ICONS[item.id as keyof typeof ICONS] ?? Award;
            return (
              <li key={item.id} className="flex flex-col items-start" data-reveal-text>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--store-red)]/30 bg-white text-[var(--store-red)]">
                  <Icon className="h-6 w-6" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="mt-6  text-xl tracking-wide text-[var(--store-ink)]">
                  {item.label}
                </p>
                <p className="mt-3 font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                  Crafted with integrity — every bottle reflects our commitment to authenticity
                  and quality.
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
