import { useMemo } from "react";
import { useStorefrontCatalog } from "@/hooks/useStorefrontCatalog";
import { selectBestsellers } from "@/lib/storefront-catalog-picks";
import { StoreProductCarousel } from "@/components/storefront/StoreProductCarousel";
import { StoreProductSectionHeader } from "@/components/storefront/StoreProductSectionHeader";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";

type BestsellersSectionProps = {
  theme?: StoreSectionTheme;
};

export function BestsellersSection({ theme = "light" }: BestsellersSectionProps) {
  const { data: catalog = [], isPending } = useStorefrontCatalog();

  const products = useMemo(() => selectBestsellers(catalog, 12), [catalog]);

  return (
    <StoreHomeSection
      theme={theme}
      className="overflow-hidden"
      aria-labelledby="bestsellers-heading"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <StoreProductSectionHeader
          id="bestsellers-heading"
          title="Best Selling Products"
          subtitle="Fresh cuts our customers order again and again."
          eyebrow="Bestsellers"
          theme={theme}
          viewAllLabel="View all"
          viewAllHref="/collection?filter=best-sellers"
        />

        <div role="tabpanel" aria-labelledby="bestsellers-heading">
          <StoreProductCarousel
            products={products}
            carouselLabel="Bestsellers"
            isLoading={isPending}
            loadingMessage="Loading bestsellers…"
            emptyMessage="No products available yet."
            variant="luxury"
            theme={theme}
          />
        </div>
      </div>
    </StoreHomeSection>
  );
}
