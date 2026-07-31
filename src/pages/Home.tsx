import { useEffect, useState } from "react";
import { DeliveryInfoStrip } from "@/components/storefront/DeliveryInfoStrip";
import { DeliveryOrderBar } from "@/components/storefront/DeliveryOrderBar";
import { HomeHeroBanner } from "@/components/storefront/HomeHeroBanner";
import type { HeroSlide } from "@/types/cms.types";
import { ShopByCategoryGrid } from "@/components/storefront/ShopByCategoryGrid";
import { SpecialCutsSection } from "@/components/storefront/SpecialCutsSection";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { WhyChooseSection } from "@/components/storefront/WhyChooseSection";
import { StoreMotionProvider } from "@/components/storefront/motion/StoreMotionProvider";
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
      <StoreMotionProvider>
        <HomeHeroBanner slides={heroSlides} />
        <DeliveryInfoStrip />
        <ShopByCategoryGrid />
        <WhyChooseSection />
        <SpecialCutsSection />
        <DeliveryOrderBar />
        <StoreFooter />
        <WhatsAppButton />
      </StoreMotionProvider>
    </main>
  );
}
