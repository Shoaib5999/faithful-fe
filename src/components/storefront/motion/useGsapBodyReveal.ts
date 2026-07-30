import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapBodyRevealOptions = {
  delay?: number;
  disabled?: boolean;
};

export function useGsapBodyReveal<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  triggerRef?: RefObject<HTMLElement | null>,
  options: UseGsapBodyRevealOptions = {},
) {
  const { delay = MOTION.bodyReveal.delay, disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const trigger = triggerRef?.current ?? el;

    if (reducedMotion) {
      gsap.set(el, { y: 0, opacity: 1 });
      return;
    }

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.set(el, { y: MOTION.bodyReveal.y, opacity: 0 });

      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: MOTION.bodyReveal.duration,
        delay,
        ease: MOTION.bodyReveal.ease,
        scrollTrigger: {
          trigger,
          start: MOTION.titleReveal.start,
          once: true,
        },
      });
    }, trigger);

    return () => ctx.revert();
  }, [elementRef, triggerRef, delay, disabled, reducedMotion, pathname]);
}
