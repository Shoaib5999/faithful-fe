import {
  STORE_AUTH_STORAGE_KEY,
  STORE_SESSION_TOKEN_KEY,
} from "@/constants/store-auth.constants";
import { getApiBaseUrl, getStoreGoogleAuthUrl } from "@/config/api";
import {
  buildStoreCustomer,
  clearStoreCustomer,
  saveStoreCustomer,
} from "@/lib/store-auth";
import type { StoreCustomer } from "@/types/store-customer.types";

export { getStoreGoogleAuthUrl };

type StoreTokens = {
  accessToken: string;
  refreshToken: string;
};

type StoreUserProfile = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export const getStoreTokens = (): StoreTokens | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_SESSION_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreTokens;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveStoreTokens = (tokens: StoreTokens): void => {
  localStorage.setItem(STORE_SESSION_TOKEN_KEY, JSON.stringify(tokens));
};

export const clearStoreTokens = (): void => {
  localStorage.removeItem(STORE_SESSION_TOKEN_KEY);
};

export const mapProfileToStoreCustomer = (
  profile: StoreUserProfile,
  existing: StoreCustomer | null = null,
): StoreCustomer => {
  const fromApi = buildStoreCustomer({
    name: profile.name,
    email: profile.email,
    phone: existing?.phone ?? "",
    address: existing?.address ?? "",
  });

  return (
    fromApi ?? {
      name: profile.name?.trim() ?? "",
      email: profile.email?.trim().toLowerCase() ?? "",
      phone: existing?.phone ?? "",
      address: existing?.address ?? "",
    }
  );
};

export const fetchStoreUserProfile = async (
  accessToken: string,
): Promise<StoreUserProfile> => {
  const response = await fetch(`${getApiBaseUrl()}/users/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Could not load profile (${response.status})`,
    );
  }

  const result = await response.json();
  return result.data as StoreUserProfile;
};

type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: StoreUserProfile;
};

const readExistingCustomer = (): StoreCustomer | null => {
  try {
    const raw = localStorage.getItem(STORE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoreCustomer;
  } catch {
    return null;
  }
};

const parseApiMessage = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => ({}));
  return (
    (body as { message?: string }).message ??
    `Request failed (${response.status})`
  );
};

export const establishStoreSession = async (
  accessToken: string,
  refreshToken: string,
): Promise<StoreCustomer> => {
  saveStoreTokens({ accessToken, refreshToken });
  const profile = await fetchStoreUserProfile(accessToken);
  const customer = mapProfileToStoreCustomer(profile, readExistingCustomer());
  saveStoreCustomer(customer);
  return customer;
};

export const completeStoreGoogleSession = async (
  accessToken: string,
  refreshToken: string,
): Promise<StoreCustomer> => establishStoreSession(accessToken, refreshToken);

export const loginStoreWithEmail = async (
  email: string,
  password: string,
): Promise<StoreCustomer> => {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  const data = result.data as AuthTokenResponse;
  return establishStoreSession(data.accessToken, data.refreshToken);
};

export type RegisterStoreResult = {
  requiresVerification: boolean;
  message: string;
  email: string;
};

export const registerStoreWithEmail = async (
  name: string,
  email: string,
  password: string,
): Promise<RegisterStoreResult> => {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  const data = result.data as RegisterStoreResult & Partial<AuthTokenResponse>;

  if (data.requiresVerification) {
    return {
      requiresVerification: true,
      message:
        data.message ??
        "Account created. Please verify your email before signing in.",
      email: data.email ?? email.trim().toLowerCase(),
    };
  }

  if (data.accessToken && data.refreshToken) {
    await establishStoreSession(data.accessToken, data.refreshToken);
    return {
      requiresVerification: false,
      message: "Account created successfully.",
      email: data.user?.email ?? email.trim().toLowerCase(),
    };
  }

  return {
    requiresVerification: true,
    message: "Please check your email to verify your account before signing in.",
    email: email.trim().toLowerCase(),
  };
};

export const resendVerificationEmail = async (email: string): Promise<string> => {
  const response = await fetch(`${getApiBaseUrl()}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  return (
    (result as { message?: string }).message ??
    "If this email is registered and unverified, a verification link has been sent."
  );
};

export const forgotPassword = async (email: string): Promise<string> => {
  const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  return (
    (result as { message?: string }).message ??
    "If an account exists for this email, you will receive reset instructions shortly."
  );
};

/** @deprecated Use `forgotPassword` */
export const requestStorePasswordReset = forgotPassword;

export type VerifyResetTokenResult = {
  valid: boolean;
};

const readVerifyResetValidity = (body: unknown): boolean => {
  if (!body || typeof body !== "object") return false;

  const record = body as {
    data?: { valid?: boolean };
    valid?: boolean;
  };

  if (typeof record.data?.valid === "boolean") return record.data.valid;
  if (typeof record.valid === "boolean") return record.valid;
  return false;
};

export const verifyResetToken = async (
  token: string,
): Promise<VerifyResetTokenResult> => {
  const trimmed = token.trim();
  if (!trimmed) return { valid: false };

  const query = new URLSearchParams({ token: trimmed });
  const response = await fetch(
    `${getApiBaseUrl()}/auth/verify-reset-token?${query.toString()}`,
  );

  if (!response.ok) {
    return { valid: false };
  }

  const result = await response.json().catch(() => null);
  return { valid: readVerifyResetValidity(result) };
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<string> => {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error("Reset link is invalid or expired.");
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: trimmedToken, newPassword }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  return (
    (result as { message?: string }).message ??
    "Your password has been reset. You can sign in now."
  );
};

export const logoutStoreSession = async (): Promise<void> => {
  const tokens = getStoreTokens();
  clearStoreTokens();
  clearStoreCustomer();

  if (tokens?.refreshToken) {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    } catch {
      // Local session already cleared
    }
  }
};

export const hasStoreSession = (): boolean => Boolean(getStoreTokens());

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<string> => {
  const tokens = getStoreTokens();
  if (!tokens?.accessToken) {
    throw new Error("Please sign in to change your password.");
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  clearStoreTokens();
  clearStoreCustomer();

  const result = await response.json();
  return (
    (result as { message?: string }).message ??
    "Password changed successfully. Please sign in again."
  );
};

export const updateStoreProfile = async (name: string): Promise<StoreUserProfile> => {
  const tokens = getStoreTokens();
  if (!tokens?.accessToken) {
    throw new Error("Please sign in to update your profile.");
  }

  const response = await fetch(`${getApiBaseUrl()}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ name: name.trim() }),
  });

  if (!response.ok) {
    throw new Error(await parseApiMessage(response));
  }

  const result = await response.json();
  return result.data as StoreUserProfile;
};
