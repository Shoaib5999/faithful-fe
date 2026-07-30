import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapClipRevealOptions = {
  disabled?: boolean;
};

export function useGsapClipReveal<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  triggerRef?: RefObject<HTMLElement | null>,
  options: UseGsapClipRevealOptions = {},
) {
  const { disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const trigger = triggerRef?.current ?? el;

    if (reducedMotion) {
      gsap.set(el, { clipPath: MOTION.clipReveal.to });
      return;
    }

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.set(el, { clipPath: MOTION.clipReveal.from });

      gsap.to(el, {
        clipPath: MOTION.clipReveal.to,
        duration: MOTION.clipReveal.duration,
        ease: MOTION.clipReveal.ease,
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
