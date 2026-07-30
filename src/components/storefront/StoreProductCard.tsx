import { isProductPlaceholderImage } from "@/constants/product-image.constants";
import { getCategoryDisplayLabel } from "@/constants/storefront.constants";
import { useCartActions } from "@/context/CartContext";
import { formatProductBadgeLabel } from "@/lib/product-api";
import { cn } from "@/lib/utils";
import { getDiscountPercent, type HomeProduct } from "@/types/storefront-catalog.types";
import { Heart, Loader2, Plus, Zap } from "lucide-react";
import { useMemo, useState, memo, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type StoreProductCardProps = {
  product: HomeProduct;
  inlineActions?: boolean;
  variant?: "default" | "editorial";
  wishlisted?: boolean;
  isWishlistUpdating?: boolean;
  onToggleWishlist?: (productId: string) => void | Promise<void>;
};

const formatInr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function PlaceholderCardFace({ product }: { product: HomeProduct }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[var(--store-cream)]">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--store-ink) 0, var(--store-ink) 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }}
      />
      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
    </div>
  );
}

function WishlistButton({
  wishlisted,
  isWishlistUpdating,
  onToggle,
  size = "sm",
}: {
  wishlisted?: boolean;
  isWishlistUpdating?: boolean;
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      disabled={isWishlistUpdating}
      onClick={onToggle}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/85 text-[var(--store-ink)]/55 backdrop-blur-sm transition-all hover:bg-white hover:text-[var(--store-ink)] disabled:opacity-50",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
      )}
    >
      {isWishlistUpdating ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <Heart
          strokeWidth={1.5}
          className={cn(
            "transition-colors",
            size === "sm" ? "h-3 w-3" : "h-[15px] w-[15px]",
            wishlisted ? "fill-red-500 text-red-500" : "fill-none",
          )}
        />
      )}
    </button>
  );
}

function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
}: {
  sizes: HomeProduct["sizes"];
  selectedSize: string;
  onSelect: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select size">
      {sizes.map((size) => {
        const isSelected = selectedSize === size.label;
        const isDisabled = !size.isAvailable;
        return (
          <button
            key={size.label}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onSelect(size.label);
            }}
            className={cn(
              "rounded border px-2.5 py-1 font-store-body text-[10px] font-semibold uppercase tracking-[0.1em] transition-all duration-200",
              isSelected
                ? "border-[var(--store-ink)] bg-[var(--store-ink)] text-white"
                : "border-black/12 bg-transparent text-[var(--store-muted)] hover:border-[var(--store-red)] hover:text-[var(--store-ink)]",
              isDisabled ? "cursor-not-allowed opacity-35" : "cursor-pointer",
            )}
            aria-pressed={isSelected}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}

export const StoreProductCard = memo(function StoreProductCard({
  product,
  inlineActions = false,
  variant = "default",
  wishlisted,
  isWishlistUpdating,
  onToggleWishlist,
}: StoreProductCardProps) {
  const { addItem, buyNow, openCart } = useCartActions();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const productPath = `/product/${product.slug}`;
  const availableSizes = useMemo(() => product.sizes.filter((s) => s.isAvailable), [product.sizes]);
  const initialSize = availableSizes[0]?.label ?? product.sizes[0]?.label ?? "";
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const selectedSizeEntry = useMemo(
    () =>
      product.sizes.find((s) => s.label === selectedSize) ??
      availableSizes[0] ??
      product.sizes[0],
    [product.sizes, selectedSize, availableSizes],
  );
  const displayPrice = selectedSizeEntry?.price ?? product.price;
  const displayCompareAtPrice = selectedSizeEntry?.compareAtPrice ?? product.compareAtPrice;
  const discount = getDiscountPercent(displayPrice, displayCompareAtPrice);
  const isPlaceholder = isProductPlaceholderImage(product.image);

  const freshnessTags = product.storefrontMeta?.freshnessTags ?? [];
  const cutInfo = product.storefrontMeta?.cutInfo ?? "";

  const buildCartItem = () => {
    const sizeEntry =
      availableSizes.find((s) => s.label === selectedSize) ??
      availableSizes[0] ??
      product.sizes.find((s) => s.label === selectedSize) ??
      product.sizes[0];
    if (!sizeEntry?.variantId) return null;
    return {
      variantId: sizeEntry.variantId,
      name: product.name,
      image: product.image,
      price: formatInr(sizeEntry.price),
      priceNumber: sizeEntry.price,
      notes: `${getCategoryDisplayLabel(product.categorySlug)} · ${sizeEntry.label}`,
      categorySlug: product.categorySlug,
    };
  };

  const handleAddToCart = async (e?: MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item = buildCartItem();
    if (!item) return;
    setAddingToCart(true);
    try {
      await addItem(item);
      openCart();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const item = buildCartItem();
    if (!item) return;
    setBuyingNow(true);
    try {
      await buyNow(item);
      navigate("/checkout");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleToggleWishlist = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await onToggleWishlist?.(product.id);
  };

  if (variant === "editorial") {
    return (
      <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
        <div className="relative isolate overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-[var(--store-cream)]">
            <Link
              to={productPath}
              className="absolute inset-0 z-[5] cursor-pointer"
              aria-label={product.name}
              draggable={false}
            >
              {isPlaceholder ? (
                <PlaceholderCardFace product={product} />
              ) : (
                <img
                  src={product.image}
                  alt=""
                  className="block h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
              )}
            </Link>

            {/* <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              {fragranceFamily && (
                <span className="bg-[var(--store-red)] px-2.5 py-1 font-store-body text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
                  {fragranceFamily}
                </span>
              )}
              {product.badge && (
                <span className="bg-[var(--store-ink)] px-2.5 py-1 font-store-body text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[var(--store-shadow-sm)]">
                  {formatProductBadgeLabel(product.badge)}
                </span>
              )}
            </div> */}

            <div className="absolute right-4 top-4 z-20">
              <WishlistButton
                wishlisted={wishlisted}
                isWishlistUpdating={isWishlistUpdating}
                onToggle={handleToggleWishlist}
                size="md"
              />
            </div>
{/* 
            {discount > 0 && (
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-[var(--store-red)] px-2.5 py-1 font-store-body text-[10px] font-bold tracking-tight text-white">
                  {discount}% off
                </span>
              </div>
            )} */}
          </div>
        </div>

        <div className="flex flex-1 flex-col border-t border-black/6 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link to={productPath} className="min-w-0 flex-1 transition-opacity hover:opacity-70">
              <p className="store-text-eyebrow text-[var(--store-red)]">
                {getCategoryDisplayLabel(product.categorySlug)}
              </p>
              <p className="mt-1 font-store-display text-lg font-medium tracking-wide text-[var(--store-ink)]">
                {product.name}
              </p>
            </Link>
            <Link
              to={productPath}
              className="shrink-0 pt-1 text-right transition-opacity hover:opacity-70"
            >
              <div className="font-store-body text-base font-semibold text-[var(--store-ink)]">
                {formatInr(displayPrice)}
              </div>
              {discount > 0 && (
                <div className="font-store-body text-[11px] text-[var(--store-muted)] line-through">
                  {formatInr(displayCompareAtPrice)}
                </div>
              )}
            </Link>
          </div>

          {cutInfo && (
          <div className="mt-2 flex items-center justify-between">
            <Link
              to={productPath}
              className="font-store-body text-[12px] leading-relaxed text-[var(--store-muted)] transition-opacity hover:opacity-70"
            >
              {cutInfo}
            </Link>

            {discount > 0 && (
              <span className="bg-[var(--store-red)] px-2.5 py-1 font-store-body text-[10px] font-bold tracking-tight text-white whitespace-nowrap">
                {discount}% off
              </span>
            )}
          </div>
        )}

          {/* {(vibeTags.length > 0 || occasionTags.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--store-red)]/50 bg-[var(--store-red)]/8 px-2 py-0.5 font-store-body text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--store-red-dark)]"
                >
                  {tag}
                </span>
              ))}
              {occasionTags.map((tag) => (
                <span
                  key={tag}
                  className="border border-black/15 bg-black/[0.03] px-2 py-0.5 font-store-body text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--store-ink)]/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )} */}

          <div className="mt-4 border-t border-black/6 pt-4">
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={buyingNow || addingToCart}
              className="store-btn-press flex flex-1 cursor-pointer items-center justify-center gap-1.5 border border-[var(--store-red-dark)] py-2.5 font-store-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--store-red-dark)] transition-colors hover:bg-[var(--store-red-dark)] hover:text-white disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Add to cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyingNow || addingToCart}
              className="store-btn-press flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-[var(--store-red-dark)] py-2.5 font-store-body text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--store-red)] disabled:opacity-50"
            >
              {buyingNow ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3" /> Buy now
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex w-full min-w-0 flex-col">
      <div className="relative isolate overflow-hidden rounded-sm">
        <div className="relative aspect-square overflow-hidden bg-[var(--store-cream)]">
          <Link
            to={productPath}
            className="absolute inset-0 z-[5] cursor-pointer"
            aria-label={product.name}
            draggable={false}
          >
            {isPlaceholder ? (
              <PlaceholderCardFace product={product} />
            ) : (
              <img
                src={product.image}
                alt=""
                className="block h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
                draggable={false}
              />
            )}
          </Link>

          {/* <div className="absolute left-2.5 top-2.5 z-20">
            {fragranceFamily && (
              <span className="bg-[var(--store-red)] px-2 py-0.5 font-store-body text-[8px] font-semibold uppercase tracking-[0.18em] text-white">
                {fragranceFamily}
              </span>
            )}
          </div> */}

          <div className="absolute right-2.5 top-2.5 z-20">
            <WishlistButton
              wishlisted={wishlisted}
              isWishlistUpdating={isWishlistUpdating}
              onToggle={handleToggleWishlist}
              size="sm"
            />
          </div>

          {discount > 0 && (
            <div className="absolute bottom-2.5 left-2.5 z-20">
              <span className="bg-[var(--store-red)] px-2 py-0.5 font-store-body text-[9px] font-bold tracking-tight text-white">
                {discount}%
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-[380ms] [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0 group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex w-full items-center justify-center gap-2 bg-[var(--store-red-dark)] py-3 font-store-body text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--store-red)] disabled:opacity-60"
            >
              {addingToCart ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Quick add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={productPath} className="min-w-0 flex-1 transition-opacity hover:opacity-65">
            <p className="font-store-body text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--store-red)]">
              {getCategoryDisplayLabel(product.categorySlug)}
            </p>
            <p className="mt-0.5 font-store-body text-[13px] font-medium leading-snug tracking-wide text-[var(--store-ink)]">
              {product.name}
            </p>
          </Link>
          <Link
            to={productPath}
            className="shrink-0 pt-0.5 text-right transition-opacity hover:opacity-65"
          >
            <div className="font-store-body text-[13px] font-semibold text-[var(--store-ink)]">
              {formatInr(displayPrice)}
            </div>
            {discount > 0 && (
              <div className="font-store-body text-[10px] text-[var(--store-muted)] line-through">
                {formatInr(displayCompareAtPrice)}
              </div>
            )}
          </Link>
        </div>

        {/* {vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vibeTags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--store-red)]/50 bg-[var(--store-red)]/8 px-1.5 py-0.5 font-store-body text-[8px] font-medium uppercase tracking-[0.12em] text-[var(--store-red-dark)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )} */}

        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
        />
      </div>
    </article>
  );
});
