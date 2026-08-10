import { useEffect, useState } from "react";
import { BestsellersSection } from "@/components/storefront/BestsellersSection";
import { DeliveryInfoStrip } from "@/components/storefront/DeliveryInfoStrip";
import { DeliveryOrderBar } from "@/components/storefront/DeliveryOrderBar";
import { FeaturedCollectionsSection } from "@/components/storefront/FeaturedCollectionsSection";
import { HomeHeroBanner } from "@/components/storefront/HomeHeroBanner";
import { InstagramFollowSection } from "@/components/storefront/InstagramFollowSection";
import { NewArrivalsSection } from "@/components/storefront/NewArrivalsSection";
import { ProcessSection } from "@/components/storefront/ProcessSection";
import type { HeroSlide } from "@/types/cms.types";
import { ShopByCategoryGrid } from "@/components/storefront/ShopByCategoryGrid";
import { SpecialCutsSection } from "@/components/storefront/SpecialCutsSection";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { WhyChooseSection } from "@/components/storefront/WhyChooseSection";
import { StoreMotionProvider } from "@/components/storefront/motion/StoreMotionProvider";
import { StoreSEO } from "@/components/storefront/StoreSEO";
import { fetchStorefrontSliders } from "@/services/slider-service";

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetchStorefrontSliders()
      .then((slides) => {
        if (!cancelled) setHeroSlides(slides);
      })
      .catch(() => {
        if (!cancelled) setHeroSlides([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="storefront min-h-screen w-full overflow-x-clip">
      <StoreSEO path="/" />
      <StoreMotionProvider>
        <HomeHeroBanner slides={heroSlides} />
        <DeliveryInfoStrip />
        <ShopByCategoryGrid />
        <BestsellersSection theme="dark" />
        <SpecialCutsSection />
        <NewArrivalsSection theme="light" />
        <FeaturedCollectionsSection theme="dark" />
        <ProcessSection theme="light" />
        <WhyChooseSection />
        <InstagramFollowSection theme="light" />
        <DeliveryOrderBar />
        <StoreFooter />
        <WhatsAppButton />
      </StoreMotionProvider>
    </main>
  );
}
