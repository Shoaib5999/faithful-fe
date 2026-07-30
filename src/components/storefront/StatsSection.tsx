import { useRef } from "react";
import { TRUST_BADGES } from "@/constants/storefront.constants";
import {
  parseStatValue,
  useGsapCountUp,
} from "@/components/storefront/motion/useGsapCountUp";
import { cn } from "@/lib/utils";

function StatItem({
  value,
  label,
  isFirst,
}: {
  value: string;
  label: string;
  isFirst: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const { number, suffix } = parseStatValue(value);

  useGsapCountUp(valueRef, sectionRef, { endValue: number, suffix });

  return (
    <div
      ref={sectionRef}
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 py-4 text-center md:px-10",
        !isFirst && "border-l border-[var(--store-ink)]/10",
      )}
    >
      <span
        ref={valueRef}
        className="font-display text-[clamp(2.5rem,5vw,4rem)] font-normal leading-none tracking-wide text-[var(--store-red)]"
      >
        0{suffix}
      </span>
      <span className="mt-3 font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-ink)]">
        {label}
      </span>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      className="w-full bg-[var(--store-cream)] py-20 md:py-28 lg:py-32"
      aria-label="Brand credentials"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-stretch px-6 md:flex-row md:px-12 xl:px-16">
        {TRUST_BADGES.map((badge, index) => (
          <StatItem
            key={badge.label}
            value={badge.value}
            label={badge.label}
            isFirst={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
