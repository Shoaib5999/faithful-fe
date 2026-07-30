import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";
import { cn } from "@/lib/utils";

export type StoreSectionTheme = "light" | "dark" | "red";

type StoreHomeSectionProps<T extends ElementType = "section"> = {
  as?: T;
  theme: StoreSectionTheme;
  children: ReactNode;
  compact?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export const StoreHomeSection = forwardRef(function StoreHomeSection<
  T extends ElementType = "section",
>(
  { as, theme, children, className, compact = false, ...props }: StoreHomeSectionProps<T>,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const Component = (as ?? "section") as ElementType;
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { "--section-reveal": 0 },
        {
          "--section-reveal": 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 96%",
            end: "top 58%",
            scrub: 0.85,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  const setRef = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <Component
      ref={setRef}
      data-store-theme={theme}
      className={cn(
        "store-home-section relative w-full overflow-hidden",
        compact ? "py-12 md:py-16" : "py-16 md:py-20 lg:py-24",
        theme === "light"
          ? "store-home-section--light"
          : theme === "red"
            ? "store-home-section--red"
            : "store-home-section--dark",
        className,
      )}
      {...props}
    >
      <div
        className="store-home-section__feather pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 md:h-28"
        aria-hidden
      />
      <div className="store-home-section__inner relative z-[2]">{children}</div>
    </Component>
  );
}) as <T extends ElementType = "section">(
  props: StoreHomeSectionProps<T> & { ref?: React.ForwardedRef<HTMLElement> },
) => React.ReactElement | null;
