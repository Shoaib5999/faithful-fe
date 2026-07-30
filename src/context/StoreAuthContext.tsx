import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  buildStoreCustomer,
  clearStoreCustomer,
  formatStorePhone,
  getCustomerFirstName,
  getStoreCustomer,
  mergeStoreCustomerPhoneFromAddresses,
  normalizeStorePhone,
  saveStoreCustomer,
  sanitizeStoredName,
} from "@/lib/store-auth";
import { SESSION_EXPIRED_EVENT } from "@/lib/session-tokens";
import {
  clearStoreTokens,
  fetchStoreUserProfile,
  getStoreTokens,
  hasStoreSession,
  logoutStoreSession,
  mapProfileToStoreCustomer,
} from "@/services/store-auth-service";
import { fetchStoreAddresses } from "@/services/store-address-service";
import type { StoreCustomer } from "@/types/store-customer.types";

type StoreAuthContextValue = {
  customer: StoreCustomer | null;
  isLoggedIn: boolean;
  isBootstrapping: boolean;
  completeAuth: (customer: StoreCustomer) => void;
  updateCustomer: (customer: StoreCustomer) => void;
  logout: () => void;
  formatPhone: (phone?: string) => string;
  getFirstName: (name?: string) => string;
};

const StoreAuthContext = createContext<StoreAuthContextValue | null>(null);

export function StoreAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<StoreCustomer | null>(() => getStoreCustomer());
  const [isBootstrapping, setIsBootstrapping] = useState(() => hasStoreSession());

  useEffect(() => {
    const tokens = getStoreTokens();
    if (!tokens) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const profile = await fetchStoreUserProfile(tokens.accessToken);
        if (cancelled) return;
        let merged = mapProfileToStoreCustomer(profile, getStoreCustomer());
        if (!normalizeStorePhone(merged.phone)) {
          try {
            const addresses = await fetchStoreAddresses();
            merged = mergeStoreCustomerPhoneFromAddresses(merged, addresses) ?? merged;
          } catch {
            // Profile can still load without a saved phone
          }
        }
        setCustomer(merged);
        saveStoreCustomer(merged);
      } catch {
        if (!cancelled) {
          clearStoreTokens();
          clearStoreCustomer();
          setCustomer(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setCustomer(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  const persistCustomer = useCallback((next: StoreCustomer) => {
    const built = buildStoreCustomer(next);
    if (!built) return;
    setCustomer(built);
    saveStoreCustomer(built);
  }, []);

  const completeAuth = useCallback(
    (next: StoreCustomer) => {
      persistCustomer(next);
    },
    [persistCustomer],
  );

  const updateCustomer = useCallback(
    (next: StoreCustomer) => {
      persistCustomer(next);
    },
    [persistCustomer],
  );

  const logout = useCallback(() => {
    void logoutStoreSession();
    setCustomer(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const formatPhone = useCallback(
    (phone?: string) => formatStorePhone(phone ?? customer?.phone ?? ""),
    [customer?.phone],
  );

  const getFirstName = useCallback(
    (name?: string) => getCustomerFirstName(name ?? customer?.name ?? ""),
    [customer?.name],
  );

  const isLoggedIn = hasStoreSession();

  const value = useMemo(
    () => ({
      customer,
      isLoggedIn,
      isBootstrapping,
      completeAuth,
      updateCustomer,
      logout,
      formatPhone,
      getFirstName,
    }),
    [
      customer,
      isLoggedIn,
      isBootstrapping,
      completeAuth,
      updateCustomer,
      logout,
      formatPhone,
      getFirstName,
    ],
  );

  return <StoreAuthContext.Provider value={value}>{children}</StoreAuthContext.Provider>;
}

export function useStoreAuth(): StoreAuthContextValue {
  const ctx = useContext(StoreAuthContext);
  if (!ctx) {
    throw new Error("useStoreAuth must be used within StoreAuthProvider");
  }
  return ctx;
}

export function useStoreDisplayName(): string {
  const { customer } = useStoreAuth();
  const name = sanitizeStoredName(customer?.name);
  return name || "Guest";
}
