/**
 * API base URL — set VITE_API_URL in .env (required, no code fallbacks).
 *
 * Local dev with Vite proxy:
 *   VITE_API_URL=/api
 *   VITE_API_PROXY_TARGET=http://127.0.0.1:3001
 *
 * Direct API (production or remote):
 *   VITE_API_URL=https://your-api.example.com/api
 */

export const normalizeApiBaseUrl = (url: string): string => url.trim().replace(/\/$/, "");

const requireApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL?.trim();

  if (!url) {
    throw new Error("VITE_API_URL is not set. Add it to your .env file.");
  }

  return normalizeApiBaseUrl(url);
};

/**
 * Base URL for all backend requests. No trailing slash.
 */
export const getApiBaseUrl = (): string => requireApiBaseUrl();

export const getStoreGoogleAuthUrl = (): string => `${getApiBaseUrl()}/auth/google`;
