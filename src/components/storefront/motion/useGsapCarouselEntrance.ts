import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapCarouselEntranceOptions = {
  disabled?: boolean;
};

export function useGsapCarouselEntrance<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  triggerRef?: RefObject<HTMLElement | null>,
  options: UseGsapCarouselEntranceOptions = {},
) {
  const { disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const trigger = triggerRef?.current ?? el;

    if (reducedMotion) {
      gsap.set(el, { x: 0, opacity: 1 });
      return;
    }

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.set(el, { x: MOTION.carouselEntrance.x, opacity: 0 });

      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: MOTION.carouselEntrance.duration,
        ease: MOTION.carouselEntrance.ease,
        scrollTrigger: {
          trigger,
          start: MOTION.titleReveal.start,
          once: true,
        },
      });
    }, trigger);

    return () => ctx.revert();
  }, [elementRef, triggerRef, disabled, reducedMotion, pathname]);
}
