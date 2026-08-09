import { useMemo } from "react";
import { useStorefrontCatalog } from "@/hooks/useStorefrontCatalog";
import { selectNewArrivals } from "@/lib/storefront-catalog-picks";
import { StoreProductCarousel } from "@/components/storefront/StoreProductCarousel";
import { StoreProductSectionHeader } from "@/components/storefront/StoreProductSectionHeader";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";

type NewArrivalsSectionProps = {
  theme?: StoreSectionTheme;
};

export function NewArrivalsSection({ theme = "dark" }: NewArrivalsSectionProps) {
  const { data: catalog = [], isPending } = useStorefrontCatalog();
  const products = useMemo(() => selectNewArrivals(catalog, 12), [catalog]);

  return (
    <StoreHomeSection theme={theme} compact aria-labelledby="new-arrivals-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <StoreProductSectionHeader
          id="new-arrivals-heading"
          eyebrow="Just landed"
          title="New arrivals"
          subtitle="Fresh compositions from the house — limited first impressions."
          theme={theme}
          viewAllHref="/collection?sort=featured"
        />

        <StoreProductCarousel
          products={products}
          carouselLabel="New arrivals"
          isLoading={isPending}
          loadingMessage="Loading new arrivals…"
          emptyMessage="No new arrivals yet."
          variant="luxury"
          theme={theme}
        />
      </div>
    </StoreHomeSection>
  );
}
