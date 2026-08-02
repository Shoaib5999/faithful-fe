import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

import { resolveSlideImageUrl } from "@/lib/slider-utils";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/cms.types";

const FEATURE_BADGES = [
  { icon: Award, label: "100% Fresh Meat" },
  { icon: UtensilsCrossed, label: "Hygienic Cutting" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: Truck, label: "Fast & Safe Delivery" },
] as const;

const ROTATE_MS = 6000;
const MOBILE_QUERY = "(max-width: 1023px)";

type HomeHeroBannerProps = {
  slides?: HeroSlide[];
};

export function HomeHeroBanner({ slides = [] }: HomeHeroBannerProps) {
  const isLoading = slides.length === 0;
  const activeSlides = slides;

  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_QUERY).matches,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: activeSlides.length > 1,
    align: "start",
    duration: 24,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!emblaApi || isLoading) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, isLoading]);

  useEffect(() => {
    if (
      isLoading ||
      !emblaApi ||
      activeSlides.length <= 1 ||
      isHovering
    )
      return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [emblaApi, activeSlides.length, isHovering, isLoading]);

  const showControls = !isLoading && activeSlides.length > 1;

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      aria-label="Faithful Meat"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 md:px-12 lg:grid-cols-2 lg:gap-8 lg:px-16 lg:py-16">
        {/* Left */}
        <div className="relative z-[1] order-2 lg:order-1">
          <h1 className="font-store-body text-[clamp(2rem,5vw,3.25rem)] font-black uppercase leading-[1.05] tracking-tight">
            <span className="text-[var(--store-red)]">
              Fresh Meat &amp; Fish
            </span>
            <br />
            <span className="text-[var(--store-ink)]">
              Delivered To Your
            </span>
            <br />
            <span className="text-[var(--store-ink)]">Doorstep</span>
          </h1>

          <p className="mt-5 font-store-body text-sm font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
            100% Fresh&nbsp;&nbsp;|&nbsp;&nbsp;Hygienic&nbsp;&nbsp;|&nbsp;&nbsp;Premium
            Quality
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8">
            {FEATURE_BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className="h-5 w-5 shrink-0 text-[var(--store-red)]"
                  strokeWidth={1.75}
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
              <span>&rarr;</span>
            </Link>

            <div className="inline-flex items-center gap-2.5 rounded-md bg-[var(--store-ink)] px-6 py-3">
              <Truck
                className="h-5 w-5 shrink-0 text-white"
                strokeWidth={1.75}
              />
              <span className="font-store-body text-xs font-bold uppercase leading-tight tracking-[0.04em] text-white">
                Free Home Delivery
                <br />
                <span className="font-medium normal-case text-white/70">
                  On every order
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div
          className="group/hero relative order-1 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--store-ink)] shadow-[var(--store-shadow-lg)] ring-1 ring-black/5 lg:order-2 lg:aspect-[5/4]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200">
              <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            </div>
          ) : (
            <>
              <div ref={emblaRef} className="h-full w-full overflow-hidden">
                <div className="flex h-full touch-pan-y">
                  {activeSlides.map((slide, i) => (
                    <div
                      key={slide.id}
                      className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                    >
                      <img
                        src={resolveSlideImageUrl(slide, isMobile)}
                        alt="Fresh meat and fish selection"
                        className="h-full w-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

              <div className="pointer-events-none absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-white bg-[var(--store-red)] text-center shadow-lg sm:h-20 sm:w-20">
                <span className="font-store-body text-[8px] font-bold uppercase leading-none text-white sm:text-[9px]">
                  Premium
                </span>
                <span className="mt-1 font-store-body text-[8px] font-bold uppercase leading-none text-white sm:text-[9px]">
                  Quality
                </span>
              </div>

              {showControls && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => emblaApi?.scrollPrev()}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/50 focus-visible:opacity-100 group-hover/hero:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => emblaApi?.scrollNext()}
                    className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/50 focus-visible:opacity-100 group-hover/hero:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div
                    className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5"
                    role="tablist"
                    aria-label="Hero image navigation"
                  >
                    {activeSlides.map((slide, i) => (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={i === selectedIndex}
                        aria-label={`Show image ${i + 1}`}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === selectedIndex
                            ? "w-6 bg-[var(--store-red)]"
                            : "w-1.5 bg-white/50 hover:bg-white/75",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}