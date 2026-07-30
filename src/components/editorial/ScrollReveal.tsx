import { type ReactNode } from "react";
import { useScrollReveal } from "@/components/storefront/motion/useScrollReveal";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  /** Animation delay in ms */
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function ScrollReveal({ children, className = "", delay = 0, direction = "up" }: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ delay, direction });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
