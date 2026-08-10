import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Star,
  ThumbsUp,
} from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import {
  StoreGhostButton,
  StoreInput,
  StorePageContainer,
  StorePrimaryButton,
  StorePrimaryLink,
  StoreTextarea,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { StoreProductCarousel } from "@/components/storefront/StoreProductCarousel";
import { ProductDetailAccordions } from "@/components/storefront/product-detail/ProductDetailAccordions";
import { ProductDetailCoupons } from "@/components/storefront/product-detail/ProductDetailCoupons";
import { ProductDetailPurchaseActions } from "@/components/storefront/product-detail/ProductDetailPurchaseActions";
import { ProductDetailPaymentMethods } from "@/components/storefront/product-detail/ProductDetailPaymentMethods";
import { ProductDetailMeatInfo } from "@/components/storefront/product-detail/ProductDetailMeatInfo";
import { ProductDetailGallery } from "@/components/storefront/product-detail/ProductDetailGallery";
import { ProductDetailHeader } from "@/components/storefront/product-detail/ProductDetailHeader";
import { ProductDetailPricing } from "@/components/storefront/product-detail/ProductDetailPricing";
import { ProductDetailSizeSelector } from "@/components/storefront/product-detail/ProductDetailSizeSelector";
import { ProductDetailTrustPillars } from "@/components/storefront/product-detail/ProductDetailTrustPillars";
import { useCart } from "@/context/CartContext";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import {
  fetchReviewEligibility,
  submitProductReview,
} from "@/services/store-review-service";
import { getErrorMessage } from "@/lib/error";
import {
  formatInr,
  type StoreProductDetail,
} from "@/lib/store-product-detail";
import {
  fetchRelatedStorefrontProducts,
  fetchStorefrontProductBySlug,
  fetchStorefrontProductReviews,
  type StorefrontReview,
  type StorefrontReviewStats,
} from "@/services/storefront-product-service";
import { StoreSEO } from "@/components/storefront/StoreSEO";
import { SITE_URL, buildCanonical } from "@/constants/seo.constants";
import { cn } from "@/lib/utils";

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <div className="flex text-[#f5c518]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(sizeClass, i < Math.round(rating) ? "fill-current" : "fill-none")}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: StorefrontReview }) {
  const [helpful, setHelpful] = useState(false);
  const count = helpful ? review.helpfulCount + 1 : review.helpfulCount;

  return (
    <div className={cn(storePanelClass, "px-4 py-6 sm:px-5 sm:py-7")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--store-cream)] font-store-body text-[11px] font-semibold text-[var(--store-ink)]">
            {review.initials}
          </div>
          <div>
            <p className="font-store-body text-xs font-semibold text-[var(--store-ink)]">{review.name}</p>
            <p className="mt-0.5 font-store-body text-[10px] text-[var(--store-muted)]">
              {review.city} · {review.date}
            </p>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>
      <p className="mt-4 font-store-body text-[11px] font-semibold uppercase tracking-wide text-[var(--store-ink)]">
        {review.title}
      </p>
      <p className="mt-2 font-store-body text-xs leading-relaxed text-[var(--store-muted)]">
        {review.body}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-4">
        <span className="flex items-center gap-1 font-store-body text-[10px] text-[#2d8a4e]">
          <CheckCircle2 className="h-3 w-3" />
          Verified purchase
        </span>
        <button
          type="button"
          onClick={() => setHelpful((h) => !h)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 font-store-body text-[10px]",
            helpful ? "text-[var(--store-red)]" : "text-[var(--store-muted)]",
          )}
        >
          <ThumbsUp className={cn("h-3 w-3", helpful && "fill-[var(--store-red)]")} />
          Helpful ({count})
        </button>
      </div>
    </div>
  );
}

type ReviewsSectionProps = {
  productId: string;
  summary: StorefrontReviewStats;
  isLoading: boolean;
};

function ReviewsSection({ productId, summary, isLoading }: ReviewsSectionProps) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useStoreAuth();
  const { openAuth } = useStoreAuthUi();
  const [showAll, setShowAll] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const { data: reviewData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["storefront-reviews", productId, showAll],
    queryFn: () =>
      fetchStorefrontProductReviews(productId, 1, showAll ? 50 : 10),
    enabled: Boolean(productId),
  });

  const { data: eligibility } = useQuery({
    queryKey: ["review-eligibility", productId],
    queryFn: () => fetchReviewEligibility(productId),
    enabled: Boolean(productId) && isLoggedIn,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitProductReview({
        productId,
        orderId: eligibility?.eligibleOrders[0]?.orderId,
        rating: draftRating,
        title: draftTitle.trim() || undefined,
        comment: draftBody.trim(),
      }),
    onSuccess: async () => {
      setSubmitSuccess(true);
      setSubmitError(null);
      setIsWriteOpen(false);
      setDraftRating(0);
      setHoverRating(0);
      setDraftTitle("");
      setDraftBody("");
      await queryClient.invalidateQueries({ queryKey: ["review-eligibility", productId] });
      await queryClient.invalidateQueries({ queryKey: ["storefront-reviews", productId] });
    },
    onError: (err) => {
      setSubmitError(getErrorMessage(err));
    },
  });

  const reviews = reviewData?.reviews ?? [];
  const stats = reviewData?.stats ?? summary;
  const visible = showAll ? reviews : reviews.slice(0, 3);
  const totalReviews = stats.total || summary.total;

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      openAuth("login");
      return;
    }
    if (eligibility?.alreadyReviewed) {
      setSubmitError("You have already reviewed this product.");
      setIsWriteOpen(false);
      return;
    }
    if (!eligibility?.canReview) {
      setSubmitError(
        eligibility?.reason ??
          "You can review this product after your order is delivered.",
      );
      setIsWriteOpen(false);
      return;
    }
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsWriteOpen((open) => !open);
  };

  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      openAuth("login");
      return;
    }
    if (!draftRating || !draftBody.trim()) return;
    submitMutation.mutate();
  };

  const displayAverage = stats.average > 0 ? stats.average : summary.average;
  const writeDisabled =
    !isLoggedIn ||
    eligibility?.alreadyReviewed ||
    (isLoggedIn && eligibility !== undefined && !eligibility.canReview);

  return (
    <section className="mt-12 border-t border-black/10 pt-10" id="reviews">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RevealTitle
          as="h2"
          className=" text-lg font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-xl"
        >
          Customer reviews
        </RevealTitle>
        <StoreGhostButton
          type="button"
          onClick={handleWriteReviewClick}
          disabled={writeDisabled}
          className="text-[10px] tracking-[0.12em]"
        >
          Write a review
        </StoreGhostButton>
      </div>

      {!isLoggedIn && (
        <p className="mt-3 font-store-body text-xs text-[var(--store-muted)]">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="cursor-pointer font-semibold text-[var(--store-red)] underline underline-offset-2"
          >
            Sign in
          </button>{" "}
          to write a review after your order is delivered.
        </p>
      )}

      {isLoggedIn && eligibility?.alreadyReviewed && (
        <p className="mt-3 font-store-body text-xs text-[var(--store-muted)]">
          You have already submitted a review for this product.
        </p>
      )}

      {isLoggedIn && eligibility && !eligibility.canReview && !eligibility.alreadyReviewed && (
        <p className="mt-3 font-store-body text-xs text-[var(--store-muted)]">
          {eligibility.reason}
        </p>
      )}

      {submitError && (
        <p className="mt-3 font-store-body text-xs text-[#c45c5c]">{submitError}</p>
      )}

      {isWriteOpen && !submitSuccess && (
        <div className={cn(storePanelClass, "mt-5 bg-[var(--store-cream)]/30 p-5")}>
          <p className="font-store-body text-xs font-semibold uppercase tracking-[0.1em] text-[var(--store-ink)]">
            Your rating
          </p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setDraftRating(i + 1)}
                className="cursor-pointer text-[var(--store-red)]"
                aria-label={`Rate ${i + 1} stars`}
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    i < (hoverRating || draftRating) ? "fill-current" : "fill-none",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <StoreInput
            type="text"
            placeholder="Review title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="mt-4"
          />
          <StoreTextarea
            placeholder="Share your experience with this product…"
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            rows={4}
            className="mt-3"
          />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <StorePrimaryButton
              type="button"
              onClick={handleSubmitReview}
              disabled={!draftRating || !draftBody.trim() || submitMutation.isPending}
              className="text-[10px] tracking-[0.12em]"
            >
              {submitMutation.isPending ? "Submitting…" : "Submit review"}
            </StorePrimaryButton>
            <button
              type="button"
              onClick={() => setIsWriteOpen(false)}
              className="cursor-pointer px-5 py-2.5 font-store-body text-[10px] text-[var(--store-muted)] hover:text-[var(--store-ink)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className={cn(storePanelClass, "mt-5 flex items-center gap-2 px-4 py-3 font-store-body text-xs text-[#2d8a4e]")}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Thank you! Your review has been submitted for moderation.
        </div>
      )}

      <div className={cn(storePanelClass, "mt-6 flex flex-wrap items-start gap-6 p-5 sm:gap-8 sm:p-6")}>
        <div className="flex items-center gap-3">
          <span className=" text-5xl font-bold text-[var(--store-ink)]">
            {displayAverage > 0 ? displayAverage.toFixed(1) : "—"}
          </span>
          <div>
            {displayAverage > 0 && <StarRow rating={displayAverage} size="md" />}
            <p className="mt-1 font-store-body text-[10px] text-[var(--store-muted)]">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        {totalReviews > 0 && (
          <div className="flex flex-col gap-2">
            {stats.breakdown.map(({ stars, count }) => (
              <div
                key={stars}
                className="flex items-center gap-2 font-store-body text-[10px] text-[var(--store-muted)]"
              >
                <span className="w-4 text-right">{stars}★</span>
                <div className="h-1.5 w-28 overflow-hidden rounded-sm bg-[var(--store-cream)]">
                  <div
                    className="h-full rounded-sm bg-[var(--store-red)]"
                    style={{
                      width: `${Math.round((count / totalReviews) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-4">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {(isLoading || reviewsLoading) && (
          <div className="flex items-center justify-center py-10 text-[var(--store-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && !reviewsLoading && visible.length === 0 && (
          <div className={cn(storePanelClass, "py-10 text-center")}>
            <p className="font-store-body text-sm text-[var(--store-muted)]">
              No reviews yet. Be the first to share your experience.
            </p>
          </div>
        )}
        {!isLoading &&
          !reviewsLoading &&
          visible.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>

      {!showAll && reviews.length > 3 && (
        <StoreGhostButton
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-6 w-full py-2.5 text-[10px] tracking-wider"
        >
          Show all {reviews.length} reviews
        </StoreGhostButton>
      )}
    </section>
  );
}

function ProductNotFound() {
  return (
    <StorePageShell>
      <StorePageContainer
        className={`${storePageSectionClass} flex min-h-[50vh] flex-col items-center justify-center pt-24 text-center`}
      >
        <RevealTitle as="h1" className=" text-2xl font-bold uppercase">
          Product not found
        </RevealTitle>
        <StorePrimaryLink to="/collection" className="mt-6">
          Continue shopping
        </StorePrimaryLink>
      </StorePageContainer>
    </StorePageShell>
  );
}

function ProductLoading() {
  return (
    <StorePageShell>
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" />
      </div>
    </StorePageShell>
  );
}

function ProductDetailView({ product }: { product: StoreProductDetail }) {
  const navigate = useNavigate();
  const { addItem, buyNow, openCart } = useCart();

  const defaultVariant =
    product.variants.find((v) => v.isAvailable) ?? product.variants[0];

  const [variantId, setVariantId] = useState<string | undefined>(defaultVariant?.id);
  const [qty, setQty] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    if (defaultVariant) setVariantId(defaultVariant.id);
    setQty(1);
    setGalleryIdx(0);
  }, [product.slug, defaultVariant?.id]);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? defaultVariant,
    [product, variantId, defaultVariant],
  );

  /** Unique image URLs for main + thumbs (API `gallery` already lists all product images). */
  const gallery = useMemo(() => {
    const raw = [
      product.image,
      ...(product.gallery.length > 0 ? product.gallery : []),
    ].filter(Boolean);
    const seen = new Set<string>();
    return raw.filter((url) => {
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [product.image, product.gallery]);

  const { data: related = [] } = useQuery({
    queryKey: ["storefront-related", product.slug, product.categorySlug],
    queryFn: () =>
      fetchRelatedStorefrontProducts(product.slug, product.categorySlug, 8),
    enabled: Boolean(product.slug),
  });

  const reviewSummary = useMemo(
    () => ({
      average: product.rating,
      total: product.reviewCount,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
    }),
    [product.rating, product.reviewCount],
  );

  const handleShare = useCallback(() => {
    if (navigator.share) {
      void navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    }
  }, [product.name]);

  if (!variant) {
    return <ProductNotFound />;
  }

  const inStock = variant.isAvailable && variant.stockQty > 0;
  const salePrice = variant.price;
  const mrp = variant.compareAtPrice;
  const discount =
    mrp > salePrice ? Math.round(((mrp - salePrice) / mrp) * 100) : product.discountPercent;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery.length > 0 ? gallery : [product.image],
    sku: variant.sku,
    brand: { "@type": "Brand", name: "Faithful Meat" },
    offers: {
      "@type": "Offer",
      url: buildCanonical(`/product/${product.slug}`),
      priceCurrency: "INR",
      price: salePrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    // Only real, verified-purchase reviews (Review model) feed this — never a fabricated rating.
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...(product.categorySlug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.categoryLabel,
              item: `${SITE_URL}/collection?category=${encodeURIComponent(product.categorySlug)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.categorySlug ? 3 : 2,
        name: product.name,
        item: buildCanonical(`/product/${product.slug}`),
      },
    ],
  };

  const buildCartItem = () => ({
    variantId: variant.id,
    name: `${product.name} · ${variant.label}`,
    image: product.image,
    price: formatInr(salePrice),
    priceNumber: salePrice,
    notes: `${product.categoryLabel} · ${variant.label}`,
    categorySlug: product.categorySlug,
    stockQty: variant.stockQty,
  });

  const handleAddToCart = async () => {
    if (!inStock) return;
    await addItem(buildCartItem(), qty);
    openCart();
  };

  const handleBuyNow = async () => {
    if (!inStock) return;
    await buyNow(buildCartItem(), qty);
    navigate("/checkout");
  };

  return (
    <StorePageShell>
      <StoreSEO
        path={`/product/${product.slug}`}
        title={`Buy ${product.name} Online in Daltonganj, Palamu`}
        description={`${product.name} — fresh, hygienically packed and hand-cut. Same-day delivery in Daltonganj, Palamu, Jharkhand from Faithful Meat.`}
        image={product.image}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <StorePageContainer className={`${storePageSectionClass} overflow-x-clip pt-4 lg:pt-6`}>
        <nav className="mb-4 hidden font-store-body text-[11px] text-[var(--store-muted)] lg:block">
          <Link to="/" className="hover:text-[var(--store-ink)]">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/collection" className="hover:text-[var(--store-ink)]">Shop</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--store-ink)]">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pt-4 xl:gap-14 xl:pt-5">
          <div className="min-w-0 max-w-full overflow-x-hidden">
            <div className="w-full max-w-full lg:sticky lg:top-24 lg:z-[1]">
              <div className="lg:hidden">
                <ProductDetailHeader
                  product={product}
                  variant={variant}
                  onShare={handleShare}
                />
              </div>
              <ProductDetailGallery
                product={product}
                gallery={gallery}
                galleryIdx={galleryIdx}
                onSelect={setGalleryIdx}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="hidden lg:block">
              <ProductDetailHeader
                product={product}
                variant={variant}
                onShare={handleShare}
              />
            </div>

            <ProductDetailPricing
              salePrice={salePrice}
              mrp={mrp}
              savingsAmount={product.savingsAmount}
              discount={discount}
            />

            <p
              className={cn(
                "mt-2 font-store-body text-xs font-medium",
                inStock ? "text-[#2d8a4e]" : "text-[#c45c5c]",
              )}
            >
              {inStock ? `In stock` : "Out of stock"}
            </p>

            <ProductDetailSizeSelector
              variants={product.variants}
              activeVariantId={variant.id}
              onSelect={setVariantId}
            />

            <ProductDetailPurchaseActions
              qty={qty}
              maxQty={Math.max(1, variant.stockQty)}
              onQtyChange={(nextQty) =>
                setQty(Math.min(Math.max(1, nextQty), Math.max(1, variant.stockQty)))
              }
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              disabled={!inStock}
            />

            <ProductDetailTrustPillars />
            <ProductDetailCoupons />
            <ProductDetailPaymentMethods />
            <ProductDetailMeatInfo origin={product.origin} freshnessTags={product.freshnessTags} />
          </div>
        </div>

        <div className="mt-2 lg:mt-10">
          {/* Legacy fragrance "vibe" content removed — no meat equivalent */}
          <ProductDetailAccordions product={product} variant={variant} />
          <ReviewsSection
            productId={product.id}
            summary={reviewSummary}
            isLoading={false}
          />

          {related.length > 0 && (
            <section className="mt-10 max-w-full overflow-hidden" aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className=" text-lg font-bold uppercase tracking-wide md:text-xl"
              >
                You may also like
              </h2>
              <StoreProductCarousel
                products={related}
                carouselLabel="Related products"
                resetKey={product.slug}
              />
            </section>
          )}
        </div>
      </StorePageContainer>
    </StorePageShell>
  );
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["storefront-product", slug],
    queryFn: () => fetchStorefrontProductBySlug(slug!),
    enabled: Boolean(slug),
    retry: false,
  });

  if (!slug) {
    return <ProductNotFound />;
  }

  if (isError) {
    return <ProductNotFound />;
  }

  if (isPending || !product) {
    return <ProductLoading />;
  }

  return <ProductDetailView product={product} />;
}
