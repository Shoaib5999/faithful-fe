import { INSTAGRAM } from "@/constants/storefront.constants";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { GOOGLE_REVIEWS } from "@/constants/google-reviews.constants";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/constants/product-image.constants";

export type ReviewShowcaseCard = {
  id: string;
  kind: "review" | "instagram";
  imageSrc: string;
  displayName: string;
  quote: string;
  location?: string;
  rating?: number;
  alt: string;
  href?: string;
};

const SHOWCASE_DUMMY_IMAGES = [
  CATEGORY_R2_IMAGES.chicken,
  CATEGORY_R2_IMAGES.mutton,
  CATEGORY_R2_IMAGES.fish,
  CATEGORY_R2_IMAGES.seafood,
] as const;

const INSTAGRAM_MOMENTS = [
  {
    displayName: INSTAGRAM.handle,
    quote: "Fresh cuts, delivered daily",
    href: INSTAGRAM.url,
  },
  { displayName: "Behind the counter", quote: "How we prep and pack every order", href: INSTAGRAM.url },
  { displayName: "Customer kitchens", quote: "What our customers are cooking", href: INSTAGRAM.url },
] as const;

export const resolveReviewShowcaseImage = (
  productSlug: string | undefined,
  fallbackIndex: number,
): string => {
  return SHOWCASE_DUMMY_IMAGES[fallbackIndex % SHOWCASE_DUMMY_IMAGES.length] ?? PRODUCT_PLACEHOLDER_IMAGE;
};

export const buildReviewShowcaseCards = (): ReviewShowcaseCard[] => {
  const reviewCards: ReviewShowcaseCard[] = GOOGLE_REVIEWS.map((review, index) => ({
    id: review.id,
    kind: "review" as const,
    imageSrc: resolveReviewShowcaseImage(review.productSlug, index),
    displayName: review.displayName,
    quote: review.quote,
    location: review.location,
    rating: review.rating ?? 5,
    alt: `Review by ${review.displayName}`,
  }));

  const instagramCards: ReviewShowcaseCard[] = INSTAGRAM_MOMENTS.map((moment, index) => ({
    id: `ig-${index + 1}`,
    kind: "instagram" as const,
    imageSrc: resolveReviewShowcaseImage(undefined, GOOGLE_REVIEWS.length + index),
    displayName: moment.displayName,
    quote: moment.quote,
    alt: moment.displayName,
    href: moment.href,
  }));

  return [...reviewCards, ...instagramCards];
};

export type ReviewPilePosition = {
  top: string;
  left: string;
  rotate: number;
  layer: number;
};

const BASE_PILE_POSITIONS: ReviewPilePosition[] = [
  { top: "34%", left: "28%", rotate: -5, layer: 20 },
  { top: "30%", left: "40%", rotate: 4, layer: 19 },
  { top: "38%", left: "14%", rotate: 7, layer: 18 },
  { top: "32%", left: "52%", rotate: -6, layer: 17 },
  { top: "18%", left: "32%", rotate: 3, layer: 16 },
  { top: "20%", left: "16%", rotate: -4, layer: 15 },
  { top: "22%", left: "48%", rotate: 8, layer: 14 },
  { top: "48%", left: "24%", rotate: -3, layer: 13 },
  { top: "46%", left: "38%", rotate: 5, layer: 12 },
  { top: "44%", left: "54%", rotate: -7, layer: 11 },
  { top: "6%", left: "38%", rotate: 2, layer: 10 },
  { top: "50%", left: "8%", rotate: -8, layer: 9 },
  { top: "4%", left: "20%", rotate: -6, layer: 8 },
  { top: "2%", left: "54%", rotate: 5, layer: 7 },
  { top: "56%", left: "28%", rotate: -4, layer: 6 },
  { top: "58%", left: "44%", rotate: 6, layer: 5 },
  { top: "26%", left: "62%", rotate: -9, layer: 4 },
  { top: "42%", left: "66%", rotate: 4, layer: 3 },
  { top: "60%", left: "58%", rotate: -3, layer: 2 },
  { top: "12%", left: "8%", rotate: 7, layer: 1 },
];

export const buildReviewPilePositions = (count: number): ReviewPilePosition[] => {
  if (count <= BASE_PILE_POSITIONS.length) {
    return BASE_PILE_POSITIONS.slice(0, count);
  }

  const positions = [...BASE_PILE_POSITIONS];
  let layer = 0;

  while (positions.length < count) {
    const index = positions.length;
    positions.push({
      top: `${8 + ((index * 13) % 48)}%`,
      left: `${10 + ((index * 17) % 52)}%`,
      rotate: ((index % 9) - 4) * 2,
      layer,
    });
    layer -= 1;
  }

  return positions;
};
