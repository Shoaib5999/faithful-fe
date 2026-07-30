import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  SHOP_CATEGORIES,
  SHOP_DROPDOWN_LINKS,
} from "@/constants/storefront.constants";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { cn } from "@/lib/utils";

type StoreNavMegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function StoreNavMegaMenu({ open, onClose }: StoreNavMegaMenuProps) {
  const featured = SHOP_CATEGORIES[0];
  const featuredImage = featured ? CATEGORY_R2_IMAGES[featured.imageKey] : null;

  return (
    <div
      className={cn(
        "absolute left-1/2 top-full z-50 mt-2 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 origin-top overflow-hidden rounded-xl border border-black/10 bg-white shadow-[var(--store-shadow-lg)] transition-all duration-300",
        open
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-[0.98] opacity-0",
      )}
    >
      <div className="grid md:grid-cols-[1fr_220px]">
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="store-text-eyebrow mb-3 text-[var(--store-red)]">Browse</p>
            <ul className="space-y-1">
              {SHOP_DROPDOWN_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-md px-3 py-2 font-store-body text-sm text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]"
                  >
                    {item.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="store-text-eyebrow mb-3 text-[var(--store-red)]">Categories</p>
            <ul className="space-y-1">
              {SHOP_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={cat.to}
                    onClick={onClose}
                    className="block rounded-md px-3 py-2 font-store-body text-sm text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {featured && (
          <Link
            to={featured.to}
            onClick={onClose}
            className="store-img-zoom relative hidden min-h-[200px] overflow-hidden md:block"
          >
            {featuredImage ? (
              <img
                src={featuredImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--store-forest)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-store-body text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                Featured
              </p>
              <p className="mt-1  text-lg text-white">{featured.label}</p>
              <p className="mt-1 font-store-body text-xs text-white/70 line-clamp-2">
                {featured.description}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
