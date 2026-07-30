import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStoreAuth } from "@/context/StoreAuthContext";
import {
  addStoreCartItem,
  clearStoreCartApi,
  fetchStoreCartSummary,
  mapApiCartItemsToLines,
  removeStoreCartItem,
  updateStoreCartItem,
  type StoreCartSummary,
} from "@/services/store-cart-service";

const GUEST_CART_KEY = "faithfulmeat.cart.v1";

export interface CartItem {
  /** Cart line id (API) or `variantId` for guest-only lines */
  id: string;
  serverLineId?: string;
  variantId: string;
  name: string;
  image: string;
  price: string;
  priceNumber?: number;
  notes?: string;
  categorySlug?: string;
  stockQty?: number;
  qty: number;
}

type CartActionsValue = {
  addItem: (item: Omit<CartItem, "qty" | "id"> & { id?: string }, qty?: number) => Promise<void>;
  buyNow: (item: Omit<CartItem, "qty" | "id"> & { id?: string }, qty?: number) => Promise<void>;
  setItemQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: (coupon?: string, shippingMethod?: string) => Promise<StoreCartSummary | null>;
  openCart: () => void;
  onOpenCart: (cb: () => void) => () => void;
};

type CartStateValue = {
  items: CartItem[];
  count: number;
  summary: StoreCartSummary | null;
  isCartLoading: boolean;
};

type CartContextValue = CartStateValue & CartActionsValue;

const CartStateContext = createContext<CartStateValue | null>(null);
const CartActionsContext = createContext<CartActionsValue | null>(null);

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartItem =>
        Boolean(row) &&
        typeof row === "object" &&
        typeof (row as CartItem).variantId === "string" &&
        typeof (row as CartItem).name === "string" &&
        typeof (row as CartItem).qty === "number" &&
        (row as CartItem).qty > 0,
    );
  } catch {
    return [];
  }
}

function persistGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

async function mergeGuestCartIntoServer(guestItems: CartItem[]): Promise<void> {
  await Promise.all(guestItems.map((line) => addStoreCartItem(line.variantId, line.qty)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useStoreAuth();
  const [items, setItems] = useState<CartItem[]>(() => loadGuestCart());
  const [summary, setSummary] = useState<StoreCartSummary | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [openListeners] = useState<Set<() => void>>(() => new Set());
  const prevLoggedRef = useRef(isLoggedIn);
  const skipNextGuestPersist = useRef(false);

  const syncCartFromServer = useCallback(
    async (
      coupon?: string,
      shippingMethod?: string,
      options?: { showLoading?: boolean },
    ): Promise<StoreCartSummary | null> => {
      if (!isLoggedIn) {
        setSummary(null);
        return null;
      }

      const showLoading = options?.showLoading ?? false;
      if (showLoading) setIsCartLoading(true);

      try {
        const s = await fetchStoreCartSummary({
          coupon,
          shippingMethod,
        });
        setSummary(s);
        setItems(mapApiCartItemsToLines(s.cart.items));
        return s;
      } finally {
        if (showLoading) setIsCartLoading(false);
      }
    },
    [isLoggedIn],
  );

  const refreshCart = useCallback(
    async (coupon?: string, shippingMethod?: string): Promise<StoreCartSummary | null> =>
      syncCartFromServer(coupon, shippingMethod, { showLoading: false }),
    [syncCartFromServer],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setSummary(null);
      if (!prevLoggedRef.current) {
        return;
      }
      prevLoggedRef.current = false;
      skipNextGuestPersist.current = true;
      setItems(loadGuestCart());
      return;
    }

    prevLoggedRef.current = true;

    let cancelled = false;
    (async () => {
      setIsCartLoading(true);
      const guestSnapshot = loadGuestCart();
      try {
        if (guestSnapshot.length > 0) {
          await mergeGuestCartIntoServer(guestSnapshot);
          persistGuestCart([]);
        }
        if (cancelled) return;
        const s = await fetchStoreCartSummary();
        if (cancelled) return;
        setSummary(s);
        setItems(mapApiCartItemsToLines(s.cart.items));
      } catch {
        if (!cancelled) {
          setSummary(null);
          if (guestSnapshot.length > 0) {
            setItems(guestSnapshot);
            persistGuestCart(guestSnapshot);
          } else {
            setItems(loadGuestCart());
          }
        }
      } finally {
        if (!cancelled) setIsCartLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) return;
    if (skipNextGuestPersist.current) {
      skipNextGuestPersist.current = false;
      return;
    }
    persistGuestCart(items);
  }, [items, isLoggedIn]);

  const addItem = useCallback<CartActionsValue["addItem"]>(
    async (item, qty = 1) => {
      if (isLoggedIn) {
        await addStoreCartItem(item.variantId, qty);
        await syncCartFromServer();
        return;
      }
      setItems((prev) => {
        const existing = prev.find((p) => p.variantId === item.variantId);
        const lineId = item.variantId;
        const maxQty = item.stockQty ?? 99;
        if (existing) {
          return prev.map((p) =>
            p.variantId === item.variantId
              ? { ...p, qty: Math.min(maxQty, p.qty + qty), stockQty: item.stockQty ?? p.stockQty }
              : p,
          );
        }
        return [
          ...prev,
          {
            id: lineId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            price: item.price,
            priceNumber: item.priceNumber,
            notes: item.notes,
            categorySlug: item.categorySlug,
            stockQty: item.stockQty,
            qty: Math.min(maxQty, qty),
          },
        ];
      });
    },
    [isLoggedIn, syncCartFromServer],
  );

  const buyNow = useCallback<CartActionsValue["buyNow"]>(
    async (item, qty = 1) => {
      if (isLoggedIn) {
        await clearStoreCartApi();
        await addStoreCartItem(item.variantId, qty);
        await syncCartFromServer();
        return;
      }

      const lineId = item.variantId;
      const maxQty = item.stockQty ?? 99;
      const nextItems: CartItem[] = [
        {
          id: lineId,
          variantId: item.variantId,
          name: item.name,
          image: item.image,
          price: item.price,
          priceNumber: item.priceNumber,
          notes: item.notes,
          categorySlug: item.categorySlug,
          stockQty: item.stockQty,
          qty: Math.min(maxQty, qty),
        },
      ];
      setItems(nextItems);
      persistGuestCart(nextItems);
    },
    [isLoggedIn, syncCartFromServer],
  );

  const setItemQty = useCallback<CartActionsValue["setItemQty"]>(
    async (id, qty) => {
      if (qty <= 0) {
        if (isLoggedIn) {
          setItems((prev) => prev.filter((p) => p.id !== id));
          await removeStoreCartItem(id);
          await syncCartFromServer();
        } else {
          setItems((prev) => prev.filter((p) => p.id !== id));
        }
        return;
      }

      if (isLoggedIn) {
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
        await updateStoreCartItem(id, qty);
        await syncCartFromServer();
        return;
      }

      setItems((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const maxQty = p.stockQty ?? 99;
          return { ...p, qty: Math.min(maxQty, qty) };
        }),
      );
    },
    [isLoggedIn, syncCartFromServer],
  );

  const removeItem = useCallback<CartActionsValue["removeItem"]>(
    async (id) => {
      if (isLoggedIn) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        await removeStoreCartItem(id);
        await syncCartFromServer();
        return;
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
    },
    [isLoggedIn, syncCartFromServer],
  );

  const clear = useCallback(async () => {
    if (isLoggedIn) {
      await clearStoreCartApi();
      await syncCartFromServer();
      return;
    }
    setItems([]);
    persistGuestCart([]);
  }, [isLoggedIn, syncCartFromServer]);

  const openCart = useCallback(() => {
    openListeners.forEach((cb) => cb());
  }, [openListeners]);

  const onOpenCart = useCallback(
    (cb: () => void) => {
      openListeners.add(cb);
      return () => {
        openListeners.delete(cb);
      };
    },
    [openListeners],
  );

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  const stateValue = useMemo<CartStateValue>(
    () => ({
      items,
      count,
      summary,
      isCartLoading,
    }),
    [items, count, summary, isCartLoading],
  );

  const actionsValue = useMemo<CartActionsValue>(
    () => ({
      addItem,
      buyNow,
      setItemQty,
      removeItem,
      clear,
      refreshCart,
      openCart,
      onOpenCart,
    }),
    [addItem, buyNow, setItemQty, removeItem, clear, refreshCart, openCart, onOpenCart],
  );

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartStateContext.Provider value={stateValue}>{children}</CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const state = useContext(CartStateContext);
  const actions = useContext(CartActionsContext);
  if (!state || !actions) throw new Error("useCart must be used within CartProvider");
  return { ...state, ...actions };
}

export function useCartActions(): CartActionsValue {
  const actions = useContext(CartActionsContext);
  if (!actions) throw new Error("useCartActions must be used within CartProvider");
  return actions;
}

export function useCartCount(): number {
  const state = useContext(CartStateContext);
  if (!state) throw new Error("useCartCount must be used within CartProvider");
  return state.count;
}
