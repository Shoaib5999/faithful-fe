import { type ReactNode } from "react";
import { useGsapStaggerReveal } from "@/components/storefront/motion/useGsapStaggerReveal";
import { cn } from "@/lib/utils";

interface ScrollStaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  selector?: string;
}

export function ScrollStagger({
  children,
  className = "",
  delay = 0,
  selector = "[data-reveal-text]",
}: ScrollStaggerProps) {
  const ref = useGsapStaggerReveal<HTMLDivElement>({ delay, selector });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
