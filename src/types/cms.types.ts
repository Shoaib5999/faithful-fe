export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl: string;
  linkLabel?: string;
}

export interface Slider {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string;
  linkLabel: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface SliderApiRow {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string;
  linkLabel: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlidersListApiData {
  sliders: SliderApiRow[];
}

export type CmsHomeImageSection =
  | "category-archive"
  | "promo-banners"
  | "brand-intro";

export interface HomeImage {
  id: string;
  slotKey: string;
  section: CmsHomeImageSection;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HomeImageApiRow {
  id: string;
  slotKey: string;
  section: CmsHomeImageSection;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeImagesListApiData {
  homeImages: HomeImageApiRow[];
}

export type HomeImageMap = Record<string, HomeImage>;

export type CmsCategoryGroup = "categories";

export interface CmsCategorySlot {
  key: string;
  label: string;
  group: CmsCategoryGroup;
  imageKey: string;
}

export type BannerPosition = "homepage_top" | "homepage_middle" | "sidebar" | "category_page" | "product_page";

export type BannerImage = {
  url: string;
  storageKey: string;
};

export interface Banner {
  id: string;
  name: string;
  position: BannerPosition;
  /** Primary preview URL — kept in sync with `images[0]` */
  imageUrl: string | null;
  images: BannerImage[];
  linkUrl: string;
  width: number;
  height: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string | null;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

/** Admin GET `/reviews` list item */
export interface ReviewApiRow {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  rejectedReason?: string | null;
  createdAt: string;
  user?: { id: string; name: string | null; email?: string | null };
  product?: { id: string; name: string };
}

export interface ReviewsListApiData {
  reviews: ReviewApiRow[];
  total: number;
  page: number;
  totalPages: number;
}
