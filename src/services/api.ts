import { APP_CONFIG } from "@/constants/app.constants";
import { getApiBaseUrl } from "@/config/api";
import {
  clearAllSessions,
  readSessionTokens,
  type StoredTokens,
  writeSessionTokens,
} from "@/lib/session-tokens";

const BASE_URL = getApiBaseUrl();

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

const refreshPromises = new Map<string, Promise<string | null>>();

const refreshAccessToken = async (tokens: StoredTokens): Promise<string | null> => {
  const inFlight = refreshPromises.get(tokens.storageKey);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Refresh token failed");
      }

      const result = await response.json();
      const nextTokens = {
        accessToken: result.data.accessToken as string,
        refreshToken:
          (result.data.refreshToken as string | undefined) ?? tokens.refreshToken,
      };

      writeSessionTokens(tokens.storageKey, nextTokens);
      return nextTokens.accessToken;
    } catch {
      clearAllSessions();
      return null;
    }
  })().finally(() => {
    refreshPromises.delete(tokens.storageKey);
  });

  refreshPromises.set(tokens.storageKey, promise);
  return promise;
};

const AUTH_ENDPOINTS_WITHOUT_REFRESH = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
]);

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retry = true,
  tokenBundle?: StoredTokens | null,
): Promise<T> {
  const { params, ...init } = options;

  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const tokens = tokenBundle ?? readSessionTokens();

  if (tokens?.accessToken) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(url, { ...init, headers });

  const canRefresh =
    response.status === 401 &&
    retry &&
    tokens?.refreshToken &&
    !AUTH_ENDPOINTS_WITHOUT_REFRESH.has(endpoint);

  if (canRefresh) {
    const newAccessToken = await refreshAccessToken(tokens);

    if (newAccessToken) {
      const refreshedBundle = readSessionTokens() ?? {
        ...tokens,
        accessToken: newAccessToken,
      };
      return request<T>(endpoint, options, false, refreshedBundle);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 413) {
      throw new Error(
        "File too large for server upload limit. Use images under 10MB each, or raise nginx client_max_body_size on the server (e.g. 20M).",
      );
    }

    throw new Error(
      (errorData as { message?: string }).message ||
        `Request failed with status ${response.status}`,
    );
  }

  const result = await response.json();

  return result.data as T;
}

export const api = {
  get: <T>(endpoint: string, params?: RequestOptions["params"]) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),

  deleteWithBody: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
};
