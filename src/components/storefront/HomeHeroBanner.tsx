import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, ShieldCheck, Truck, UtensilsCrossed } from "lucide-react";
import { resolveSlideImageUrl } from "@/lib/slider-utils";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/cms.types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop";

const FEATURE_BADGES = [
  { icon: Award, label: "100% Fresh Meat" },
  { icon: UtensilsCrossed, label: "Hygienic Cutting" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: Truck, label: "Fast & Safe Delivery" },
] as const;

const ROTATE_MS = 6000;

type HomeHeroBannerProps = {
  slides?: HeroSlide[];
};

export function HomeHeroBanner({ slides = [] }: HomeHeroBannerProps) {
  const images =
    slides.length > 0 ? slides.map((s) => resolveSlideImageUrl(s, false)) : [FALLBACK_IMAGE];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative w-full overflow-hidden bg-white" aria-label="Faithful Meat">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 md:px-12 lg:grid-cols-2 lg:gap-8 lg:px-16 lg:py-16">
        {/* Left — copy */}
        <div className="relative z-[1] order-2 lg:order-1">
          <h1 className="font-store-body text-[clamp(2rem,5vw,3.25rem)] font-black uppercase leading-[1.05] tracking-tight">
            <span className="text-[var(--store-red)]">Fresh Meat &amp; Fish</span>
            <br />
            <span className="text-[var(--store-ink)]">Delivered To Your</span>
            <br />
            <span className="text-[var(--store-ink)]">Doorstep</span>
          </h1>

          <p className="mt-5 font-store-body text-sm font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
            100% Fresh&nbsp;&nbsp;|&nbsp;&nbsp;Hygienic&nbsp;&nbsp;|&nbsp;&nbsp;Premium Quality
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8">
            {FEATURE_BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className="h-5 w-5 shrink-0 text-[var(--store-red)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="font-store-body text-xs font-semibold uppercase tracking-[0.04em] text-[var(--store-ink)]">
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/collection"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--store-red)] px-8 py-3.5 font-store-body text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[var(--store-shadow-md)] transition-colors duration-200 hover:bg-[var(--store-red-dark)]"
            >
              Shop Now
              <span aria-hidden>&rarr;</span>
            </Link>
            <div className="inline-flex items-center gap-2.5 rounded-md bg-[var(--store-ink)] px-6 py-3">
              <Truck className="h-5 w-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
              <span className="font-store-body text-xs font-bold uppercase leading-tight tracking-[0.04em] text-white">
                Free Home Delivery
                <br />
                <span className="font-medium normal-case text-white/70">On every order</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right — image */}
        <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--store-ink)] sm:aspect-[16/10] lg:order-2 lg:aspect-[5/4]">
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt="Fresh meat and fish selection"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
                i === index ? "opacity-100" : "opacity-0",
              )}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          ))}

          <div
            className="pointer-events-none absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-white bg-[var(--store-red)] text-center shadow-lg sm:h-20 sm:w-20"
            aria-hidden
          >
            <span className="font-store-body text-[8px] font-bold uppercase leading-none text-white sm:text-[9px]">
              Premium
            </span>
            <span className="mt-1 font-store-body text-[8px] font-bold uppercase leading-none text-white sm:text-[9px]">
              Quality
            </span>
          </div>

          {images.length > 1 ? (
            <div
              className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5"
              role="tablist"
              aria-label="Hero image navigation"
            >
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-[var(--store-red)]"
                      : "w-1.5 bg-white/50 hover:bg-white/75",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
