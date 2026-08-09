import { useRef } from "react";
import { RITUAL_STEPS } from "@/constants/storefront.constants";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapStaggerReveal } from "@/components/storefront/motion/useGsapStaggerReveal";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import { cn } from "@/lib/utils";

type ProcessSectionProps = {
  theme?: StoreSectionTheme;
};

export function ProcessSection({ theme = "light" }: ProcessSectionProps) {
  const stepsRef = useGsapStaggerReveal<HTMLDivElement>({ selector: "[data-step]" });

  return (
    <StoreHomeSection theme={theme} compact aria-labelledby="process-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <header className="mb-8 md:mb-10">
          <RevealText variant="eyebrow" className="font-store-body text-xs uppercase tracking-[0.32em] text-[var(--store-red)]">
            How it works
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="process-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-normal leading-[1.06] tracking-wide text-[var(--section-fg)]"
          >
            From order to doorstep
          </RevealWordTitle>
        </header>

        <div
          ref={stepsRef}
          className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-y-0"
        >
          {RITUAL_STEPS.map((step, index) => (
            <div
              key={step.id}
              data-step
              className={cn(
                "relative px-4 md:px-6",
                index > 0 && "md:border-l md:border-[var(--store-red)]/30",
              )}
            >
              <span
                className="pointer-events-none absolute -left-2 -top-6 select-none font-display text-[8rem] leading-none text-[var(--section-fg)]/5 md:-top-8"
                aria-hidden
              >
                {step.numeral}
              </span>
              <div className="relative">
                <h3 className="font-display text-lg font-normal tracking-wide text-[var(--section-fg)] md:text-xl">
                  {step.heading}
                </h3>
                <p className="mt-2 font-store-body text-[14px] leading-[1.85] text-[var(--section-fg-muted)]">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StoreHomeSection>
  );
}
