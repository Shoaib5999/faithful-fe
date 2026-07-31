import { createElement, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { useGsapWordReveal } from "@/components/storefront/motion/useGsapWordReveal";

type RevealWordTitleProps<T extends ElementType = "h2"> = {
  as?: T;
  animateOnMount?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function RevealWordTitle<T extends ElementType = "h2">({
  as,
  animateOnMount = false,
  className,
  children,
  ...props
}: RevealWordTitleProps<T>) {
  const Tag = (as ?? "h2") as ElementType;
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapWordReveal(containerRef, { animateOnMount });

  const text = typeof children === "string" ? children : String(children ?? "");
  const words = text.split(" ").filter(Boolean);

  return (
    <div ref={containerRef}>
      {createElement(
        Tag,
        {
          className: cn(className),
          ...props,
        },
        words.map((word, index) => (
          <span key={`${word}-${index}`} className="store-reveal-word-mask mr-[0.25em]">
            <span className="word-inner">{word}</span>
          </span>
        )),
      )}
    </div>
  );
}
