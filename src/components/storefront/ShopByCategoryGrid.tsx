import { Link } from "react-router-dom";
import { Beef, Bird, ChefHat, Egg, Fish, Shell, Tag, type LucideIcon } from "lucide-react";
import { useStorefrontHomeImages } from "@/hooks/useStorefrontHomeImages";
import { StoreImageWithFallback } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

/** Best-effort icon per known category slot; new admin-added tiles fall back to Tag. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  chicken: Bird,
  mutton: Beef,
  fish: Fish,
  seafood: Shell,
  "ready-to-cook": ChefHat,
  eggs: Egg,
};

export function ShopByCategoryGrid() {
  const { data: homeImages = {} } = useStorefrontHomeImages();

  const tiles = Object.values(homeImages)
    .filter((item) => item.section === "category-archive")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (tiles.length === 0) return null;

  return (
    <section className="w-full bg-white py-14 md:py-20" aria-labelledby="shop-by-category-heading">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-16">
        <header className="mb-8 text-center md:mb-12">
          <p className="flex items-center justify-center gap-3 font-store-body text-xs font-bold uppercase tracking-[0.28em] text-[var(--store-red)]">
            <span className="h-px w-8 bg-[var(--store-red)]" aria-hidden />
            Shop By Category
            <span className="h-px w-8 bg-[var(--store-red)]" aria-hidden />
          </p>
          <h2
            id="shop-by-category-heading"
            className="mt-3 font-store-body text-[clamp(1.5rem,3.5vw,2.5rem)] font-black uppercase tracking-tight text-[var(--store-ink)]"
          >
            Choose Your Favourite
          </h2>
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = CATEGORY_ICONS[tile.slotKey] ?? Tag;
            const image = tile.imageUrl ?? tile.imageUrlMobile ?? "";

            return (
              <li key={tile.id}>
                <Link
                  to={tile.linkUrl}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-[var(--store-shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--store-shadow-hover)]",
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--store-cream)]">
                    <StoreImageWithFallback
                      src={image}
                      alt={tile.title}
                      icon={Icon}
                      className="transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--store-red)] text-white shadow-md sm:h-9 sm:w-9">
                      <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={1.75} aria-hidden />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col items-start gap-2.5 p-3 sm:p-4">
                    <h3 className="font-store-body text-xs font-bold uppercase leading-snug tracking-[0.02em] text-[var(--store-ink)] sm:text-sm">
                      {tile.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded bg-[var(--store-red)] px-3 py-1.5 font-store-body text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 group-hover:bg-[var(--store-red-dark)]">
                      Shop Now
                      <span aria-hidden>&rsaquo;</span>
                    </span>
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
