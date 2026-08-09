import { Link } from "react-router-dom";
import { Beef, Bird, Fish, PocketKnife } from "lucide-react";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { StoreImageWithFallback } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

const TILES = [
  {
    id: "chicken",
    label: "Chicken",
    to: "/collection?category=chicken",
    icon: Bird,
    image: CATEGORY_R2_IMAGES.chicken,
  },
  {
    id: "mutton",
    label: "Mutton",
    to: "/collection?category=mutton",
    icon: Beef,
    image: CATEGORY_R2_IMAGES.mutton,
  },
  {
    id: "fresh-fish",
    label: "Fresh Fish",
    to: "/collection?category=fish",
    icon: Fish,
    image: CATEGORY_R2_IMAGES.fish,
  },
  {
    id: "special-cuts",
    label: "Special Cuts",
    to: "/collection?filter=special-cuts",
    icon: PocketKnife,
    image: CATEGORY_R2_IMAGES.seafood,
  },
] as const;

export function ShopByCategoryGrid() {
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
          {TILES.map((tile) => (
            <li key={tile.id}>
              <Link
                to={tile.to}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-[var(--store-shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--store-shadow-hover)]",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--store-cream)]">
                  <StoreImageWithFallback
                    src={tile.image}
                    alt={tile.label}
                    icon={tile.icon}
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--store-red)] text-white shadow-md sm:h-9 sm:w-9">
                    <tile.icon
                      className="h-4 w-4 sm:h-4.5 sm:w-4.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-start gap-2.5 p-3 sm:p-4">
                  <h3 className="font-store-body text-xs font-bold uppercase leading-snug tracking-[0.02em] text-[var(--store-ink)] sm:text-sm">
                    {tile.label}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--store-red)] px-3 py-1.5 font-store-body text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 group-hover:bg-[var(--store-red-dark)]">
                    Shop Now
                    <span aria-hidden>&rsaquo;</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
