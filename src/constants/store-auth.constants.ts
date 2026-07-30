import type { StoreCustomer } from "@/types/store-customer.types";

export const STORE_SESSION_TOKEN_KEY = "faithfulmeat.store_tokens";

export const STORE_AUTH_STORAGE_KEY = "faithfulmeat.store_customer.v1";

/** Legacy key — migrated on read */
export const STORE_AUTH_STORAGE_KEY_LEGACY = "yaaro.store_customer.v1";

/** UI-only fallback — never persist this as the user's name */
export const STORE_AUTH_DEFAULT_NAME = "Faithful Meat Member";

/** Mock / auto-filled names — treated as empty in profile & storage */
export const STORE_AUTH_PLACEHOLDER_NAMES = [
  STORE_AUTH_DEFAULT_NAME,
  "Google User",
  "Faithful Meat",
] as const;

export const STORE_AUTH_PHONE_DIGITS = 10;

export const STORE_AUTH_OTP_LENGTH = 6;

export const STORE_AUTH_NAME_MIN = 2;

export const STORE_AUTH_NAME_MAX = 80;

export const STORE_AUTH_EMAIL_MAX = 120;

export const STORE_AUTH_ADDRESS_MIN = 10;

export const STORE_AUTH_ADDRESS_MAX = 300;

/** Indian mobile: 10 digits, starts with 6–9 */
export const STORE_AUTH_PHONE_REGEX = /^[6-9]\d{9}$/;

export const STORE_AUTH_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Letters, spaces, apostrophe, hyphen, dot (supports Indian / Latin names) */
export const STORE_AUTH_NAME_REGEX = /^[\p{L}\s'.-]+$/u;

export { getStoreGoogleAuthUrl } from "@/config/api";
