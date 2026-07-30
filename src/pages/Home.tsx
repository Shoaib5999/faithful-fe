import { useEffect, useState } from "react";
import { BestsellersSection } from "@/components/storefront/BestsellersSection";
import { CategorySection } from "@/components/storefront/CategorySection";
import { FeaturedCollectionsSection } from "@/components/storefront/FeaturedCollectionsSection";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import type { HeroSlide } from "@/types/cms.types";
import { InstagramFollowSection } from "@/components/storefront/InstagramFollowSection";
import { NewArrivalsSection } from "@/components/storefront/NewArrivalsSection";
import { ProcessSection } from "@/components/storefront/ProcessSection";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
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
        {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}
        <CategorySection theme="light" />
        <BestsellersSection theme="red" />
        <FeaturedCollectionsSection theme="light" />
        <NewArrivalsSection theme="red" />
        <ProcessSection theme="light" />
        <InstagramFollowSection theme="red" />
        <StoreFooter />
        <WhatsAppButton />
      </StoreMotionProvider>
    </main>
  );
}
