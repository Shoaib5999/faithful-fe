import { getStoreTokens } from "@/services/store-auth-service";
import { getApiBaseUrl } from "@/config/api";

type StoreApiJson = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export const parseStoreApiMessage = async (response: Response): Promise<string> => {
  const body = (await response.json().catch(() => ({}))) as StoreApiJson;
  return body.message ?? `Request failed (${response.status})`;
};

export const readStoreApiJson = async (response: Response): Promise<StoreApiJson> =>
  (await response.json().catch(() => ({}))) as StoreApiJson;

type StoreApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export const storeApiFetch = async (
  path: string,
  options: StoreApiFetchOptions = {},
): Promise<{ message: string; data: unknown }> => {
  const { auth = false, ...init } = options;
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const tokens = getStoreTokens();
    if (tokens?.accessToken) {
      headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const body = await readStoreApiJson(response);

  if (!response.ok) {
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }

  return {
    message: body.message ?? "Success",
    data: body.data ?? null,
  };
};
