import { useRef } from "react";
import { Droplets, FlaskConical, MapPin, ShieldCheck } from "lucide-react";
import { ProcessSection } from "@/components/storefront/ProcessSection";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { StoreSEO } from "@/components/storefront/StoreSEO";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapBodyReveal } from "@/components/storefront/motion/useGsapBodyReveal";
import { useGsapClipReveal } from "@/components/storefront/motion/useGsapClipReveal";
import {
  parseStatValue,
  useGsapCountUp,
} from "@/components/storefront/motion/useGsapCountUp";
import { useGsapStaggerReveal } from "@/components/storefront/motion/useGsapStaggerReveal";
import {
  StoreGoldCtaLink,
  StorePrimaryLink,
} from "@/components/storefront/storefront-ui";
import {
  ABOUT_PILLARS,
  ABOUT_STORY,
  PROMISE_STATS,
  STORE_LOCATION,
} from "@/constants/storefront.constants";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { cn } from "@/lib/utils";

const PILLAR_ICONS = [Droplets, FlaskConical, MapPin, ShieldCheck] as const;

function AboutStoryHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const secondaryImageRef = useRef<HTMLDivElement>(null);
  const bodyOneRef = useRef<HTMLParagraphElement>(null);
  const bodyTwoRef = useRef<HTMLParagraphElement>(null);
  const bodyThreeRef = useRef<HTMLParagraphElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useGsapClipReveal(imageRef, sectionRef);
  useGsapClipReveal(secondaryImageRef, sectionRef);
  useGsapBodyReveal(bodyOneRef, sectionRef, { delay: 0.15 });
  useGsapBodyReveal(bodyTwoRef, sectionRef, { delay: 0.27 });
  useGsapBodyReveal(bodyThreeRef, sectionRef, { delay: 0.39 });
  useGsapBodyReveal(quoteRef, sectionRef, { delay: 0.5 });

  const primaryImage = CATEGORY_R2_IMAGES.chicken;
  const secondaryImage = CATEGORY_R2_IMAGES.mutton;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-16 md:py-24 lg:py-28"
      aria-labelledby="about-story-heading"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-14">
          <div className="relative lg:col-span-7">
            <div ref={imageRef} className="store-img-zoom aspect-[5/4] overflow-hidden bg-[var(--store-cream)]">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt="Faithful Meat fresh cuts"
                  className="h-full w-full object-cover"
                  loading="eager"
                  draggable={false}
                />
              ) : null}
            </div>

            <div
              ref={secondaryImageRef}
              className="store-img-zoom absolute -bottom-10 right-4 hidden w-[42%] overflow-hidden border-4 border-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:block lg:-right-6 lg:bottom-8"
            >
              <div className="aspect-[3/4] bg-[var(--store-cream)]">
                {secondaryImage ? (
                  <img
                    src={secondaryImage}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                ) : null}
              </div>
            </div>

            <div
              ref={quoteRef}
              className="relative z-10 mx-auto mt-10 max-w-md bg-[var(--store-cream)] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:absolute md:-left-6 md:bottom-16 md:mx-0 md:max-w-[300px] md:p-8 lg:-left-10"
            >
              <p className="font-display text-[clamp(1.15rem,2.2vw,1.5rem)] font-normal leading-[1.25] tracking-wide text-[var(--store-ink)]">
                &ldquo;{ABOUT_STORY.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="mt-20 lg:col-span-5 lg:mt-0 lg:pl-4 xl:pl-8">
            <RevealText
              variant="eyebrow"
              className="font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-red)]"
            >
              Our story
            </RevealText>
            <RevealWordTitle
              as="h2"
              id="about-story-heading"
              className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.06] tracking-wide text-[var(--store-ink)]"
            >
              The Faithful Meat promise
            </RevealWordTitle>

            <div className="mt-6 space-y-5">
              <p
                ref={bodyOneRef}
                className="font-store-body text-[15px] leading-[1.85] text-[var(--store-muted)]"
              >
                {ABOUT_STORY.paragraphs[0]}
              </p>
              <p
                ref={bodyTwoRef}
                className="font-store-body text-[15px] leading-[1.85] text-[var(--store-muted)]"
              >
                {ABOUT_STORY.paragraphs[1]}
              </p>
              <p
                ref={bodyThreeRef}
                className="font-store-body text-[15px] leading-[1.85] text-[var(--store-muted)]"
              >
                {ABOUT_STORY.paragraphs[2]}
              </p>
            </div>

            <div className="mt-8">
              <StoreGoldCtaLink to="/collection">Explore the collection</StoreGoldCtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPillarsSection() {
  const pillarsRef = useGsapStaggerReveal<HTMLDivElement>({ selector: "[data-pillar]" });

  return (
    <section
      className="w-full bg-[var(--store-cream)] py-16 md:py-24 lg:py-28"
      aria-labelledby="about-pillars-heading"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <header className="mb-12 max-w-2xl md:mb-16">
          <RevealText
            variant="eyebrow"
            className="font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-red)]"
          >
            What defines us
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="about-pillars-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.06] tracking-wide text-[var(--store-ink)]"
          >
            Crafted with intention
          </RevealWordTitle>
          <RevealText delay={120} className="mt-4 font-store-body text-[15px] leading-[1.85] text-[var(--store-muted)]">
            Every order — from sourcing to the cut on your plate — reflects our belief that fresh
            meat should be hygienic, honest, and delivered fast.
          </RevealText>
        </header>

        <div
          ref={pillarsRef}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10"
        >
          {ABOUT_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? Droplets;
            return (
              <article
                key={pillar.id}
                data-pillar
                className="group store-card-hover rounded-lg border border-black/8 bg-white p-6 shadow-[var(--store-shadow-sm)] transition-[transform,box-shadow] duration-300 md:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--store-red)]/25 bg-[var(--store-cream)]/60 text-[var(--store-red)] transition-colors duration-300 group-hover:border-[var(--store-red)]/50 group-hover:bg-[var(--store-red)]/10">
                  <Icon className="h-5 w-5" strokeWidth={1.25} aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-lg tracking-wide text-[var(--store-ink)] md:text-xl">
                  {pillar.title}
                </h3>
                <p className="mt-3 font-store-body text-sm leading-[1.8] text-[var(--store-muted)]">
                  {pillar.body}
                </p>
                <span className="mt-5 block h-px w-0 bg-[var(--store-red)] transition-all duration-500 group-hover:w-12" aria-hidden />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutPromiseStat({
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
        "flex flex-1 flex-col items-center justify-center px-6 py-6 text-center md:px-10 md:py-8",
        !isFirst && "border-t border-[var(--store-ink)]/10 md:border-l md:border-t-0",
      )}
    >
      <span
        ref={valueRef}
        className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-none tracking-wide text-[var(--store-red)]"
      >
        0{suffix}
      </span>
      <span className="mt-3 font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-ink)]">
        {label}
      </span>
    </div>
  );
}

function AboutPromiseStats() {
  return (
    <section className="w-full border-y border-black/8 bg-white py-16 md:py-20" aria-label="Brand promise">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-stretch px-6 md:flex-row md:px-12 xl:px-16">
        {PROMISE_STATS.map((stat, index) => (
          <AboutPromiseStat
            key={stat.label}
            value={stat.value}
            label={stat.label}
            isFirst={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

function AboutVisitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGsapBodyReveal(cardRef, sectionRef, { delay: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--store-ink)] py-20 md:py-28 lg:py-32"
      aria-labelledby="about-visit-heading"
    >
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[var(--store-red)]/15 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[var(--store-red)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <RevealText
            variant="eyebrow"
            className="font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-red)]"
          >
            Get in touch
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="about-visit-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.06] tracking-wide text-white"
          >
            Questions about your order?
          </RevealWordTitle>
          <RevealText delay={100} className="mt-5 font-store-body text-[15px] leading-[1.85] text-white/60">
            Our team is here to help with delivery, freshness, or anything else you need.
          </RevealText>
        </div>

        <div
          ref={cardRef}
          className="mx-auto mt-12 max-w-2xl rounded-lg border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm md:mt-16 md:p-10"
        >
          <p className="font-store-body text-sm leading-[1.85] text-white/75 md:text-base">
            {STORE_LOCATION.address}
          </p>
          <p className="mt-4 font-store-body text-sm text-white/60">{STORE_LOCATION.hours}</p>
          <a
            href={`tel:${STORE_LOCATION.phoneTel}`}
            className="mt-4 inline-block font-display text-xl tracking-wide text-[var(--store-red)] transition-opacity hover:opacity-80"
          >
            {STORE_LOCATION.phoneDisplay}
          </a>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={STORE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="store-btn-press inline-flex cursor-pointer items-center justify-center rounded-md border border-white/30 px-8 py-3 font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-white transition-[transform,opacity,background-color,border-color] duration-300 hover:border-white hover:bg-white hover:text-[var(--store-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]"
            >
              Find on map
            </a>
            <StorePrimaryLink to="/contact" className="px-10">
              Get in touch
            </StorePrimaryLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <StorePageShell>
      <StoreSEO
        path="/about"
        title="About Us"
        description="Faithful Meat delivers 100% fresh, hygienically packed chicken, mutton, fish and seafood in Daltonganj, Palamu, Jharkhand — hand-cut, no preservatives, same-day."
      />
      <StorePageTitle title="About Us" eyebrow="Fresh. Hygienic. Delivered." />
      <AboutStoryHero />
      <AboutPillarsSection />
      <ProcessSection />
      <AboutPromiseStats />
      <AboutVisitSection />
    </StorePageShell>
  );
}
