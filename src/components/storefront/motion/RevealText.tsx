import { useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useGsapTitleReveal } from "@/components/storefront/motion/useGsapTitleReveal";

type RevealTextProps = ComponentPropsWithoutRef<"p"> & {
  as?: "p" | "span" | "div";
  delay?: number;
  animateOnMount?: boolean;
  variant?: "eyebrow" | "text";
};

export function RevealText({
  as: Tag = "p",
  delay = 60,
  animateOnMount = false,
  variant = "text",
  className,
  children,
  ...props
}: RevealTextProps) {
  const maskRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLElement>(null);

  useGsapTitleReveal(maskRef, innerRef, { delay, animateOnMount });

  return (
    <div ref={maskRef} className="store-reveal-text overflow-hidden">
      <Tag
        ref={innerRef as never}
        data-reveal-type={variant === "eyebrow" ? "eyebrow" : undefined}
        className={cn(className)}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}
