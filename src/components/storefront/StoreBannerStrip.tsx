import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStorefrontBannerSlides,
  subscribeBannerUpdates,
} from "@/services/banner-service";

type StoreBannerStripProps = {
  position: "homepage_middle" | "sidebar" | "category_page" | "product_page";
  className?: string;
};

export function StoreBannerStrip({ position, className }: StoreBannerStripProps) {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeBannerUpdates(() => setRevision((n) => n + 1)), []);

  const slides = useMemo(
    () => getStorefrontBannerSlides(position),
    [position, revision],
  );

  if (slides.length === 0) return null;

  return (
    <section
      className={className ?? "store-editorial-section store-bg-cream w-full"}
      aria-label="Promotional banners"
    >
      <div className="store-editorial-container flex flex-col gap-6">
        {slides.map((slide, index) => (
          <Link
            key={`${slide.imageUrl}-${index}`}
            to={slide.linkUrl || "/collection"}
            className="group block overflow-hidden"
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              className="h-auto w-full object-cover transition-transform duration-[900ms] ease-[var(--store-ease-premium)] group-hover:scale-[1.01]"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
