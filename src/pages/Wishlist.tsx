import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { StoreProductCard } from "@/components/storefront/StoreProductCard";
import {
  StoreGhostButton,
  StorePageContainer,
  StorePrimaryLink,
  storePageSectionClass,
  storePanelClass,
  storeProductGridClass,
} from "@/components/storefront/storefront-ui";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useStorefrontCatalog } from "@/hooks/useStorefrontCatalog";
import {
  clearLocalWishlist,
  dispatchWishlistChanged,
  readLocalWishlistIds,
  WISHLIST_CHANGED_EVENT,
} from "@/lib/local-wishlist";
import { mapApiProductToHomeProduct } from "@/services/storefront-product-service";
import { clearWishlistApi, fetchWishlistProducts } from "@/services/wishlist-service";
import { cn } from "@/lib/utils";

export default function Wishlist() {
  const { isLoggedIn } = useStoreAuth();
  const queryClient = useQueryClient();
  const { data: catalog = [] } = useStorefrontCatalog();
  const [localIds, setLocalIds] = useState<string[]>(() => readLocalWishlistIds());

  const { data: wishlistPage } = useQuery({
    queryKey: ["wishlist", "page"],
    queryFn: () => fetchWishlistProducts({ limit: 100 }),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    const sync = () => setLocalIds(readLocalWishlistIds());
    sync();
    window.addEventListener(WISHLIST_CHANGED_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, sync);
  }, []);

  const items = useMemo(() => {
    if (isLoggedIn && wishlistPage?.items?.length) {
      return wishlistPage.items
        .map((row) => mapApiProductToHomeProduct(row.product))
        .filter(Boolean);
    }
    return catalog.filter((p) => localIds.includes(p.id));
  }, [catalog, localIds, isLoggedIn, wishlistPage]);

  const { wishlistedById, wishlistUpdatingId, handleToggleWishlist } = useWishlist();

  const handleClear = async () => {
    if (isLoggedIn) {
      try {
        await clearWishlistApi();
        await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      } catch {
        return;
      }
    }
    clearLocalWishlist();
    dispatchWishlistChanged();
    setLocalIds([]);
  };

  return (
    <StorePageShell>
      <StorePageTitle title="Wishlist" />

      <StorePageContainer className={storePageSectionClass}>
        <p className="mb-8 text-center font-store-body text-sm text-[var(--store-muted)] md:text-left">
          {items.length} {items.length === 1 ? "item" : "items"} saved for later
        </p>

        {items.length === 0 ? (
          <div className={cn(storePanelClass, "mx-auto max-w-lg px-6 py-24 text-center md:px-10")}>
            <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--store-cream)]">
              <Heart className="h-7 w-7 text-[var(--store-red)]" strokeWidth={1.5} aria-hidden />
            </span>
            <RevealTitle
              as="h2"
              className=" text-xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-2xl"
            >
              Your wishlist is empty
            </RevealTitle>
            <p className="mx-auto mt-4 max-w-sm font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
              {isLoggedIn
                ? "Tap the heart on any product to save it here."
                : "Tap the heart on any product to save it here — works on this device before you sign in."}
            </p>
            <StorePrimaryLink to="/collection" className="mt-10 px-10">
              Shop all products
            </StorePrimaryLink>
          </div>
        ) : (
          <>
            <div className={storeProductGridClass}>
              {items.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  inlineActions
                  wishlisted={Boolean(wishlistedById[product.id])}
                  isWishlistUpdating={wishlistUpdatingId === product.id}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 sm:flex-row">
              <StoreGhostButton
                type="button"
                onClick={() => void handleClear()}
                className="inline-flex items-center gap-2 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Clear wishlist
              </StoreGhostButton>
              <StorePrimaryLink to="/collection">Continue shopping</StorePrimaryLink>
            </div>
          </>
        )}
      </StorePageContainer>
    </StorePageShell>
  );
}
