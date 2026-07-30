import React, { createContext, useState, useEffect, useCallback } from "react";
import type { AuthState } from "@/types/auth.types";
import { SESSION_EXPIRED_EVENT } from "@/lib/session-tokens";
import * as authService from "@/services/auth-service";

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const loggedOutState = (): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const session = authService.getSession();
    setState({
      user: session,
      isAuthenticated: Boolean(session),
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setState(loggedOutState());
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.login(email, password);
      authService.saveSession(user);
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logoutFn = useCallback(async () => {
    await authService.logout();
    setState(loggedOutState());
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
};
