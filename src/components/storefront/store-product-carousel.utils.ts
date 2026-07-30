import { useEffect, useState } from "react";
import type { HomeProduct } from "@/types/storefront-catalog.types";

/** Tight gaps — cards stretch to fill each column (no fixed max-width) */
export const STORE_PRODUCT_GRID_GAP = "gap-3 sm:gap-3.5 lg:gap-4";

export const chunkProducts = (items: HomeProduct[], size: number): HomeProduct[][] => {
  if (size < 1) return [items];
  const pages: HomeProduct[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
};

const resolveCardsPerSlide = (luxury: boolean) => {
  if (luxury) {
    if (window.matchMedia("(max-width: 639px)").matches) return 1;
    if (window.matchMedia("(max-width: 1023px)").matches) return 2;
    return 2;
  }
  if (window.matchMedia("(max-width: 639px)").matches) return 2;
  if (window.matchMedia("(max-width: 1023px)").matches) return 3;
  return 4;
};

export const useCardsPerSlide = (luxury = false) => {
  const [cardsPerSlide, setCardsPerSlide] = useState(() =>
    typeof window === "undefined" ? (luxury ? 2 : 4) : resolveCardsPerSlide(luxury),
  );

  useEffect(() => {
    const update = () => setCardsPerSlide(resolveCardsPerSlide(luxury));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [luxury]);

  return cardsPerSlide;
};

export const productGridColsClass = (cardsPerSlide: number) => {
  if (cardsPerSlide === 1) return "grid-cols-1";
  if (cardsPerSlide === 2) return "grid-cols-2";
  if (cardsPerSlide === 3) return "grid-cols-3";
  return "grid-cols-4";
};

export const STORE_LUXURY_GRID_GAP = "gap-6 md:gap-8 lg:gap-10";

export const productCardWrapClass = "min-w-0 w-full";
