import { useLocation } from "react-router-dom";
import { StoreLenisProvider } from "@/components/storefront/motion/StoreLenisProvider";

const LENIS_EXCLUDED_PREFIXES = [
  "/checkout",
  "/account",
  "/auth",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

function shouldEnableLenis(pathname: string): boolean {
  return !LENIS_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type StoreLenisScopeProps = {
  children: React.ReactNode;
};

/** Smooth scroll only on marketing/shop pages — not checkout or account. */
export function StoreLenisScope({ children }: StoreLenisScopeProps) {
  const { pathname } = useLocation();

  if (!shouldEnableLenis(pathname)) {
    return <>{children}</>;
  }

  return <StoreLenisProvider>{children}</StoreLenisProvider>;
}
