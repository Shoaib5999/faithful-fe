import type { ReactNode } from "react";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { StoreMotionProvider } from "@/components/storefront/motion/StoreMotionProvider";

type StorePageShellProps = {
  children: ReactNode;
  showFooter?: boolean;
};

export function StorePageShell({ children, showFooter = true }: StorePageShellProps) {
  return (
    <main className="storefront w-full overflow-x-hidden bg-white text-[var(--store-ink)]">
      <StoreMotionProvider>{children}</StoreMotionProvider>
      {showFooter && <StoreFooter />}
    </main>
  );
}
