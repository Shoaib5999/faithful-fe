import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StoreAuthModal } from "@/components/storefront/StoreAuthModal";

type AuthEntryView = "login" | "signup";

type StoreAuthUiContextValue = {
  openAuth: (view?: AuthEntryView) => void;
  closeAuth: () => void;
};

const StoreAuthUiContext = createContext<StoreAuthUiContextValue | null>(null);

export function StoreAuthUiProvider({ children }: { children: ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthEntryView>("login");

  const openAuth = useCallback((view: AuthEntryView = "login") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthModalOpen(false), []);

  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <StoreAuthUiContext.Provider value={value}>
      {children}
      <StoreAuthModal open={authModalOpen} onClose={closeAuth} initialView={authModalView} />
    </StoreAuthUiContext.Provider>
  );
}

export function useStoreAuthUi(): StoreAuthUiContextValue {
  const ctx = useContext(StoreAuthUiContext);
  if (!ctx) throw new Error("useStoreAuthUi must be used within StoreAuthUiProvider");
  return ctx;
}
