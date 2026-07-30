import { APP_CONFIG } from "@/constants/app.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
  STORE_AUTH_STORAGE_KEY,
  STORE_SESSION_TOKEN_KEY,
} from "@/constants/store-auth.constants";

export const SESSION_EXPIRED_EVENT = "faithfulmeat:session-expired";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  storageKey: string;
};

const ADMIN_EXACT_PATHS = new Set<string>([
  ROUTES.login,
  ROUTES.dashboard,
  ROUTES.products,
  ROUTES.orders,
  ROUTES.customers,
  ROUTES.leads,
  ROUTES.inventory,
  ROUTES.brands,
  ROUTES.staff,
  ROUTES.analytics,
  ROUTES.email,
  ROUTES.settings,
  ROUTES.cms,
  ROUTES.cmsReviews,
  ROUTES.coupons,
]);

/** Prefer admin tokens on panel routes; store tokens on the storefront. */
export const isAdminAppContext = (): boolean => {
  if (typeof window === "undefined") return false;

  const path = window.location.pathname;
  if (path.startsWith("/product/")) return false;

  if (ADMIN_EXACT_PATHS.has(path)) return true;
  if (path.startsWith("/cms/")) return true;

  return false;
};

const parseTokenEntry = (storageKey: string): StoredTokens | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      storageKey,
    };
  } catch {
    return null;
  }
};

export const readSessionTokens = (): StoredTokens | null => {
  const keys = isAdminAppContext()
    ? [APP_CONFIG.sessionTokenKey, STORE_SESSION_TOKEN_KEY]
    : [STORE_SESSION_TOKEN_KEY, APP_CONFIG.sessionTokenKey];

  for (const key of keys) {
    const tokens = parseTokenEntry(key);
    if (tokens) return tokens;
  }

  return null;
};

export const writeSessionTokens = (
  storageKey: string,
  tokens: Pick<StoredTokens, "accessToken" | "refreshToken">,
): void => {
  localStorage.setItem(storageKey, JSON.stringify(tokens));
};

export const clearAllSessions = (): void => {
  localStorage.removeItem(APP_CONFIG.sessionTokenKey);
  localStorage.removeItem("auth_user");
  localStorage.removeItem(STORE_SESSION_TOKEN_KEY);
  localStorage.removeItem(STORE_AUTH_STORAGE_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
};
