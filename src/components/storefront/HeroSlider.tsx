import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { resolveSlideImageUrl } from "@/lib/slider-utils";
import { storeGoldCtaClass } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/cms.types";

export type { HeroSlide };

const AUTOPLAY_MS = 7000;
const MOBILE_QUERY = "(max-width: 767px)";
const SLIDE_FRAME_CLASS =
  "relative w-full overflow-hidden aspect-[4/5] max-h-[min(65vh,580px)] sm:aspect-[16/9] sm:max-h-[min(540px,46vh)] lg:max-h-[580px]";

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    title: "",
    subtitle: "",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/collection/aesthetic",
  },
  {
    id: "2",
    title: "",
    subtitle: "",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
    linkUrl: "/collection/geometry",
  },
  {
    id: "3",
    title: "",
    subtitle: "",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/collection/monochrome",
  },
  {
    id: "4",
    title: "",
    subtitle: "",
    imageUrl:
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/collection/elevated",
  },
];

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const hasCmsCopy = (slide: HeroSlide) =>
  Boolean(slide.title?.trim() || slide.subtitle?.trim());

type HeroSliderProps = {
  slides?: HeroSlide[];
};

export function HeroSlider({ slides = DEFAULT_SLIDES }: HeroSliderProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: "start",
    duration: 30,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, slides.length, isMobile]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1 || isHovering) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [emblaApi, slides.length, isHovering, selectedIndex]);

  const showControls = slides.length > 1;

  return (
    <section
      className="group/hero relative w-full overflow-hidden bg-[var(--store-cream)]"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div ref={emblaRef} className="w-full overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, idx) => {
            const showOverlay = hasCmsCopy(slide);
            const image = (
              <img
                src={resolveSlideImageUrl(slide, isMobile)}
                alt={slide.title || `Slide ${idx + 1}`}
                className="block h-full w-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            );

            const slideBody = (
              <>
                {image}

                {showOverlay ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 pt-20 text-center sm:items-start sm:px-10 sm:pb-12 sm:pt-0 sm:text-left md:px-16 md:pb-14 lg:px-20">
                      {slide.subtitle ? (
                        <p className="store-text-eyebrow text-[var(--store-red)]">{slide.subtitle}</p>
                      ) : null}

                      {slide.title ? (
                        <h2 className="mt-2 font-display text-[clamp(1.75rem,5vw,3.5rem)] font-normal leading-[1.08] tracking-wide text-white">
                          {slide.title}
                        </h2>
                      ) : null}

                      {slide.linkUrl ? (
                        <div className="pointer-events-auto mt-6">
                          <SlideCta
                            href={slide.linkUrl}
                            label={slide.linkLabel ?? "Discover Collection"}
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </>
            );

            return (
              <div
                key={slide.id}
                className={cn(
                  "min-w-0 shrink-0 grow-0 basis-full",
                  SLIDE_FRAME_CLASS,
                )}
                aria-hidden={idx !== selectedIndex}
              >
                {!showOverlay && slide.linkUrl ? (
                  <Link
                    to={isExternalHref(slide.linkUrl) ? "#" : slide.linkUrl}
                    className="block h-full w-full"
                    aria-label={slide.linkLabel ?? "View collection"}
                    onClick={
                      isExternalHref(slide.linkUrl)
                        ? (event) => {
                            event.preventDefault();
                            window.open(slide.linkUrl, "_blank", "noopener,noreferrer");
                          }
                        : undefined
                    }
                  >
                    {slideBody}
                  </Link>
                ) : (
                  slideBody
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showControls ? (
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-5"
          role="tablist"
          aria-label="Slide navigation"
        >
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === selectedIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                idx === selectedIndex
                  ? "w-6 bg-[var(--store-red)]"
                  : "w-1.5 bg-white/35 hover:bg-white/55",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SlideCta({ href, label }: { href: string; label: string }) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={storeGoldCtaClass}
      >
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={storeGoldCtaClass}>
      {label}
    </Link>
  );
}
