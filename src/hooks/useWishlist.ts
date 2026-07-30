import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useNotification } from "@/hooks/useNotification";
import { getErrorMessage } from "@/lib/error";
import {
  dispatchWishlistChanged,
  isInLocalWishlist,
  readLocalWishlistIds,
  toggleLocalWishlist,
  WISHLIST_CHANGED_EVENT,
} from "@/lib/local-wishlist";
import {
  fetchWishlistProductIds,
  toggleWishlist,
  WISHLIST_IDS_QUERY_KEY,
} from "@/services/wishlist-service";

export function useWishlist() {
  const { isLoggedIn } = useStoreAuth();
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const [localVersion, setLocalVersion] = useState(0);
  const [wishlistUpdatingId, setWishlistUpdatingId] = useState<string | null>(null);
  const serverIdsRef = useRef<string[]>([]);

  const { data: serverIds = [] } = useQuery({
    queryKey: WISHLIST_IDS_QUERY_KEY,
    queryFn: fetchWishlistProductIds,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  serverIdsRef.current = serverIds;

  useEffect(() => {
    const onChanged = () => setLocalVersion((v) => v + 1);
    window.addEventListener(WISHLIST_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, onChanged);
  }, []);

  const wishlistedById = useMemo(() => {
    const next: Record<string, boolean> = {};
    if (isLoggedIn) {
      for (const id of serverIds) next[id] = true;
    } else {
      for (const id of readLocalWishlistIds()) next[id] = true;
    }
    return next;
  }, [isLoggedIn, serverIds, localVersion]);

  const setServerIds = useCallback(
    (updater: (prev: string[]) => string[]) => {
      queryClient.setQueryData<string[]>(WISHLIST_IDS_QUERY_KEY, (prev = []) => updater(prev));
    },
    [queryClient],
  );

  const handleToggleWishlist = async (productId: string) => {
    if (wishlistUpdatingId) return;

    const prevWishlisted = isLoggedIn
      ? serverIdsRef.current.includes(productId)
      : isInLocalWishlist(productId);

    setWishlistUpdatingId(productId);

    if (isLoggedIn) {
      setServerIds((prev) => {
        const set = new Set(prev);
        if (prevWishlisted) set.delete(productId);
        else set.add(productId);
        return [...set];
      });
    }

    try {
      if (isLoggedIn) {
        const res = await toggleWishlist(productId);
        setServerIds((prev) => {
          const set = new Set(prev);
          if (res.wishlisted) set.add(productId);
          else set.delete(productId);
          return [...set];
        });
        void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        notify(res.wishlisted ? "Saved to wishlist." : "Removed from wishlist.", "success");
        if (res.wishlisted) {
          if (!readLocalWishlistIds().includes(productId)) {
            toggleLocalWishlist(productId);
            dispatchWishlistChanged();
          }
        } else if (isInLocalWishlist(productId)) {
          toggleLocalWishlist(productId);
          dispatchWishlistChanged();
        }
      } else {
        const wishlisted = toggleLocalWishlist(productId);
        setLocalVersion((v) => v + 1);
        dispatchWishlistChanged();
        notify(wishlisted ? "Saved to wishlist." : "Removed from wishlist.", "success");
      }
    } catch (err) {
      if (isLoggedIn) {
        setServerIds((prev) => {
          const set = new Set(prev);
          if (prevWishlisted) set.add(productId);
          else set.delete(productId);
          return [...set];
        });
      }
      notify(getErrorMessage(err), "error");
    } finally {
      setWishlistUpdatingId(null);
    }
  };

  return {
    wishlistedById,
    wishlistUpdatingId,
    handleToggleWishlist,
    isWishlisted: (productId: string) =>
      Boolean(wishlistedById[productId] ?? isInLocalWishlist(productId)),
  };
}
