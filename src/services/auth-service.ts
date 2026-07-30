import { APP_CONFIG } from "@/constants/app.constants";
import { getApiBaseUrl } from "@/config/api";
import type { AuthUser } from "@/types/auth.types";
import { api } from "@/services/api";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  type VerifyResetTokenResult,
} from "@/services/store-auth-service";

export {
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  type VerifyResetTokenResult,
};

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const login = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const data = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  localStorage.setItem(
    APP_CONFIG.sessionTokenKey,
    JSON.stringify({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })
  );

  return data.user;
};

const readAdminTokens = (): { refreshToken: string } | null => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.sessionTokenKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return { refreshToken: parsed.refreshToken };
  } catch {
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const tokens = readAdminTokens();
  clearSession();

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

export const getSession = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;

    if (!readAdminTokens()) {
      localStorage.removeItem("auth_user");
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const saveSession = (user: AuthUser): void => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(APP_CONFIG.sessionTokenKey);
  localStorage.removeItem("auth_user");
};