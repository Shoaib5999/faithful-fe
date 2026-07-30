import { createElement, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { useGsapTitleReveal } from "@/components/storefront/motion/useGsapTitleReveal";

type RevealTitleProps<T extends ElementType = "h2"> = {
  as?: T;
  delay?: number;
  animateOnMount?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function RevealTitle<T extends ElementType = "h2">({
  as,
  delay = 0,
  animateOnMount = false,
  className,
  children,
  ...props
}: RevealTitleProps<T>) {
  const Tag = (as ?? "h2") as ElementType;
  const maskRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLElement>(null);

  useGsapTitleReveal(maskRef, innerRef, { delay, animateOnMount });

  return (
    <div ref={maskRef} className="store-reveal-title overflow-hidden">
      {createElement(
        Tag,
        {
          ref: innerRef,
          className: cn(className),
          ...props,
        },
        children,
      )}
    </div>
  );
}
