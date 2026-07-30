export type GoogleReviewEntry = {
  id: string;
  displayName: string;
  quote: string;
  productSlug?: string;
  location?: string;
  rating?: number;
};

/** Placeholder customer reviews for the storefront "Real voices" section — replace with real reviews once available. */
export const GOOGLE_REVIEWS: GoogleReviewEntry[] = [
  {
    id: "priya-sharma",
    displayName: "Priya Sharma",
    quote:
      "Ordered chicken curry cut and it arrived perfectly fresh, cleaned, and on time. Packaging was hygienic and leak-proof.",
    location: "Local Guide",
    rating: 5,
  },
  {
    id: "rahul-verma",
    displayName: "Rahul Verma",
    quote:
      "Best mutton I've had delivered — tender and no smell at all. Same-day delivery worked exactly as promised.",
    rating: 5,
  },
  {
    id: "ayesha-khan",
    displayName: "Ayesha Khan",
    quote:
      "The prawns were incredibly fresh, and the seafood cleaning was spot on. Will definitely order again.",
    rating: 5,
  },
  {
    id: "vikram-singh",
    displayName: "Vikram Singh",
    quote:
      "Consistent quality every single order. The weight is always accurate and the cuts are exactly what I need.",
    rating: 5,
  },
  {
    id: "neha-joshi",
    displayName: "Neha Joshi",
    quote:
      "Loved the ready-to-cook marinated chicken — saved so much prep time and tasted great.",
    rating: 5,
  },
  {
    id: "arjun-mehta",
    displayName: "Arjun Mehta",
    quote: "Fast delivery, fresh meat, and great customer support when I had a question about my order.",
    rating: 5,
  },
  {
    id: "sana-patel",
    displayName: "Sana Patel",
    quote: "Their combo packs are great value — good variety of chicken, mutton, and fish in one order.",
    rating: 5,
  },
  {
    id: "rohit-kumar",
    displayName: "Rohit Kumar",
    quote: "Hygienic packaging and zero smell — exactly what I look for in an online meat delivery service.",
    rating: 5,
  },
];
