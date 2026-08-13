import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import { useStorefrontHomeImages } from "@/hooks/useStorefrontHomeImages";
import { StoreImageWithFallback } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

export function PromoBannersSection() {
  const { data: homeImages = {} } = useStorefrontHomeImages();

  const banners = Object.values(homeImages)
    .filter((item) => item.section === "promo-banners")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (banners.length === 0) return null;

  return (
    <section
      className="w-full bg-[var(--store-cream)] py-14 md:py-20"
      aria-label="Promotional banners"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-16">
        <ul
          className={cn("grid grid-cols-1 gap-4 sm:gap-6", banners.length > 1 && "md:grid-cols-2")}
        >
          {banners.map((banner) => {
            const image = banner.imageUrl ?? banner.imageUrlMobile ?? "";

            return (
              <li key={banner.id}>
                <Link
                  to={banner.linkUrl}
                  className="group relative flex aspect-[16/11] w-full flex-col overflow-hidden rounded-lg shadow-[var(--store-shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--store-shadow-hover)]"
                >
                  <StoreImageWithFallback
                    src={image}
                    alt={banner.title}
                    icon={Megaphone}
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--store-ink)]/80 via-[var(--store-ink)]/10 to-transparent" />

                  <div className="relative z-[1] mt-auto flex flex-col gap-1.5 p-5 sm:p-7">
                    <h3 className="font-store-body text-lg font-black uppercase tracking-tight text-white sm:text-2xl">
                      {banner.title}
                    </h3>
                    {banner.subtitle ? (
                      <p className="max-w-md font-store-body text-xs text-white/80 sm:text-sm">
                        {banner.subtitle}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
