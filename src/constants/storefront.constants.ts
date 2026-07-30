export const ANNOUNCEMENT_TEXT = "Free delivery on all orders above ₹999";

export const TRUST_BADGES = [
  { value: "100%", label: "Fresh & Hygienic" },
  { value: "2hr", label: "Delivery Window" },
  { value: "0", label: "Preservatives Added" },
] as const;

export const PROMISE_STATS = [
  { value: "100%", label: "Fresh, never compromised" },
  { value: "2hr", label: "Average delivery window" },
  { value: "0", label: "Preservatives added" },
] as const;

/** "How it works" steps — order, prepare, deliver, enjoy. */
export const RITUAL_STEPS = [
  {
    id: "order",
    numeral: "01",
    heading: "Order",
    body: "Pick your cut and weight — chicken, mutton, fish, seafood, and more.",
  },
  {
    id: "prepare",
    numeral: "02",
    heading: "Hand Cut",
    body: "Freshly cut and hygienically packed by our butchers, same day.",
  },
  {
    id: "deliver",
    numeral: "03",
    heading: "Deliver",
    body: "Cold-chain delivery straight to your door within hours.",
  },
  {
    id: "enjoy",
    numeral: "04",
    heading: "Enjoy",
    body: "Farm-fresh quality you can taste, every single time.",
  },
] as const;

export const ABOUT_STORY = {
  quote: "Fresh Meat. Faithful Promise.",
  paragraphs: [
    "Faithful Meat is a fresh meat and seafood delivery service built on one simple promise: 100% fresh, hygienically packed cuts delivered straight to your door — no shortcuts, no preservatives.",
    "Every order is hand-cut to your specification and packed the same day it ships, following strict hygiene and quality standards from source to doorstep.",
    "From everyday chicken curry cut to premium seafood, we source responsibly and deliver quickly, so your kitchen never has to compromise on freshness.",
  ],
} as const;

export const ABOUT_PILLARS = [
  {
    id: "fresh",
    title: "100% Fresh",
    body: "Sourced daily and never frozen unless explicitly marked — quality you can see and taste.",
  },
  {
    id: "hygiene",
    title: "Hygienically Packed",
    body: "Vacuum-sealed and cold-chain handled from our facility to your kitchen.",
  },
  {
    id: "delivery",
    title: "Same Day Delivery",
    body: "Order before 2PM for same-day delivery across our service areas.",
  },
  {
    id: "no-preservatives",
    title: "No Preservatives",
    body: "Pure, natural meat and seafood — nothing artificial, ever.",
  },
] as const;

export const FEATURED_COLLECTIONS = [
  { id: "chicken", label: "Chicken", imageKey: "chicken", to: "/collection?category=chicken" },
  { id: "mutton", label: "Mutton", imageKey: "mutton", to: "/collection?category=mutton" },
  { id: "seafood", label: "Seafood", imageKey: "seafood", to: "/collection?category=seafood" },
] as const;

export const TRUST_CREDENTIALS = [
  { id: "fssai", label: "FSSAI Certified" },
  { id: "hygienic", label: "Hygienically Packed" },
  { id: "farm-fresh", label: "Farm Fresh" },
] as const;

export const FOOTER_NEWSLETTER = {
  title: "Faithful Meat Updates",
  subtitle: "Get delivery updates, offers, and fresh arrivals in your inbox.",
  placeholder: "Email address",
  submit: "Submit",
} as const;

export const STORE_LOCATION = {
  address: "123, Fresh Market Street, Your City - 600001",
  phoneDisplay: "098765 43210",
  phoneTel: "+919876543210",
  hours: "Monday to Sunday · 7am to 10pm",
  mapsUrl: "https://maps.google.com",
} as const;

export const STORE_CONTACT_EMAIL = "hello@faithfulmeat.com" as const;

export const CONTACT_FAQS = [
  {
    id: "hours",
    question: "What are your delivery hours?",
    answer: STORE_LOCATION.hours,
  },
  {
    id: "freshness",
    question: "How do you guarantee freshness?",
    answer:
      "Every order is hand-cut and packed the same day it ships, then kept cold-chain from our facility to your door.",
  },
  {
    id: "orders",
    question: "How long do deliveries take?",
    answer:
      "Order before 2PM for same-day delivery. Otherwise, your order arrives the next day. You'll get tracking details once it's dispatched.",
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer:
      "Fresh meat and seafood can't be returned once delivered for hygiene reasons, but we'll replace or refund any item that arrives damaged or incorrect. See our Return & Refund Policy for details.",
  },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Return & Refund Policy", to: "/returns" },
  { label: "Privacy Policy", to: "/privacy" },
] as const;

export const FOOTER_CUSTOMER_SERVICE_LINKS = [
  { label: "Contact Us", to: "/contact" },
  { label: "Track Order", to: "/track-order" },
  {
    label: "Find Store",
    href: STORE_LOCATION.mapsUrl,
    external: true,
  },
] as const;

export const FOOTER_INFORMATION_LINKS = [{ label: "About Us", to: "/about" }] as const;

export const FOOTER_QUICK_LINKS = [
  { label: "Collections", to: "/collection" },
  { label: "Best Sellers", to: "/collection?filter=best-sellers" },
] as const;

export const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/faithfulmeat/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/faithfulmeat" },
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/919876543210" },
] as const;

export const MOBILE_SHOP_EXPANDABLE = [
  {
    id: "chicken",
    label: "Chicken",
    items: [
      { label: "All", to: "/collection?category=chicken" },
      { label: "Curry Cut", to: "/collection?category=chicken&type=curry-cut" },
      { label: "Boneless", to: "/collection?category=chicken&type=boneless" },
    ],
  },
  {
    id: "mutton",
    label: "Mutton",
    items: [
      { label: "All", to: "/collection?category=mutton" },
      { label: "Curry Cut", to: "/collection?category=mutton&type=curry-cut" },
      { label: "Boneless", to: "/collection?category=mutton&type=boneless" },
    ],
  },
] as const;

export const MOBILE_SHOP_LINKS = [
  { label: "Best sellers", to: "/collection?filter=best-sellers" },
  { label: "New arrivals", to: "/collection?filter=new-arrivals" },
  { label: "Ready to Cook", to: "/collection?category=ready-to-cook" },
  { label: "Combo Packs", to: "/collection?category=combo-packs" },
] as const;

export const MAIN_NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/collection" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export const SHOP_DROPDOWN_LINKS = [
  { label: "All products", to: "/collection" },
  { label: "Best sellers", to: "/collection?filter=best-sellers" },
  { label: "New arrivals", to: "/collection?filter=new-arrivals" },
  { label: "Combo Packs", to: "/collection?category=combo-packs" },
] as const;

export const COLLECTION_SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "featured", label: "Featured" },
  { id: "best-selling", label: "Best selling" },
  { id: "name-asc", label: "Alphabetically, A–Z" },
  { id: "name-desc", label: "Alphabetically, Z–A" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
] as const;

export type CollectionSortId = (typeof COLLECTION_SORT_OPTIONS)[number]["id"];

/** URL / filter slug aliases for shop category tiles (none needed currently — kept for future renames). */
export const COLLECTION_CATEGORY_ALIASES: Record<string, string> = {};

export const resolveCollectionCategorySlug = (param: string): string =>
  COLLECTION_CATEGORY_ALIASES[param.toLowerCase()] ?? param.toLowerCase();

export const collectionCategoryToParam = (slug: string | null): string | null => {
  if (!slug) return null;
  const alias = Object.entries(COLLECTION_CATEGORY_ALIASES).find(([, value]) => value === slug)?.[0];
  return alias ?? slug;
};

/** Shop-by-category tiles — 6 tiles matching the seeded meat categories. */
export const SHOP_CATEGORIES = [
  {
    id: "chicken",
    label: "Chicken",
    categorySlug: "chicken",
    description: "Farm-fresh chicken, hand cut to order.",
    to: "/collection?category=chicken",
    column: "left" as const,
    size: "tall" as const,
    imageKey: "chicken",
  },
  {
    id: "mutton",
    label: "Mutton",
    categorySlug: "mutton",
    description: "Tender, richly marbled mutton cuts.",
    to: "/collection?category=mutton",
    column: "left" as const,
    size: "short" as const,
    imageKey: "mutton",
  },
  {
    id: "fish",
    label: "Fish",
    categorySlug: "fish",
    description: "River and sea fish, cleaned and ready.",
    to: "/collection?category=fish",
    column: "right" as const,
    size: "short" as const,
    imageKey: "fish",
  },
  {
    id: "seafood",
    label: "Seafood",
    categorySlug: "seafood",
    description: "Prawns and more, fresh off the boat.",
    to: "/collection?category=seafood",
    column: "right" as const,
    size: "tall" as const,
    imageKey: "seafood",
  },
  {
    id: "ready-to-cook",
    label: "Ready to Cook",
    categorySlug: "ready-to-cook",
    description: "Marinated and prepped — straight to the pan.",
    to: "/collection?category=ready-to-cook",
    column: "left" as const,
    size: "short" as const,
    imageKey: "ready-to-cook",
  },
  {
    id: "eggs",
    label: "Eggs",
    categorySlug: "eggs",
    description: "Farm fresh eggs, by the tray.",
    to: "/collection?category=eggs",
    column: "right" as const,
    size: "short" as const,
    imageKey: "eggs",
  },
] as const;

export const PRICE_BUCKETS = [
  {
    id: "under-300",
    label: "Under ₹300",
    subtitle: "Everyday cuts",
    min: undefined,
    max: 300,
  },
  {
    id: "300-600",
    label: "₹300 – ₹600",
    subtitle: "Family favorites",
    min: 300,
    max: 600,
  },
  {
    id: "600-1000",
    label: "₹600 – ₹1,000",
    subtitle: "Premium cuts",
    min: 600,
    max: 1000,
  },
  {
    id: "1000-plus",
    label: "₹1,000+",
    subtitle: "Combo & specialty packs",
    min: 1000,
    max: undefined,
  },
] as const;

export const INSTAGRAM = {
  handle: "@faithfulmeat",
  url: "https://www.instagram.com/faithfulmeat/",
  eyebrow: "On social",
  title: "Follow us on Instagram",
  description: "Fresh cuts, kitchen tips, and first access to new arrivals.",
  cta: "Follow on Instagram",
} as const;

const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  chicken: "Chicken",
  mutton: "Mutton",
  fish: "Fish",
  seafood: "Seafood",
  "ready-to-cook": "Ready to Cook",
  eggs: "Eggs",
  "combo-packs": "Combo Packs",
};

export function getCategoryDisplayLabel(categorySlug: string): string {
  return CATEGORY_DISPLAY_LABELS[categorySlug?.toLowerCase()] ?? "Faithful Meat";
}
