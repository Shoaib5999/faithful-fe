import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type StoreMotionProviderProps = {
  children: ReactNode;
  className?: string;
};

/** Wraps page content with a subtle enter fade on route change. */
export function StoreMotionProvider({ children, className }: StoreMotionProviderProps) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className={cn("store-page-enter", className)}>
      {children}
    </div>
  );
}
