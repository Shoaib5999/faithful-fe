import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapTitleRevealOptions = {
  delay?: number;
  /** Play on mount instead of scroll (hero titles). */
  animateOnMount?: boolean;
  disabled?: boolean;
};

export function useGsapTitleReveal<T extends HTMLElement>(
  maskRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<T | null>,
  options: UseGsapTitleRevealOptions = {},
) {
  const { delay = 0, animateOnMount = false, disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const mask = maskRef.current;
    const target = targetRef.current;
    if (!mask || !target || disabled) return;

    if (reducedMotion) {
      gsap.set(target, { yPercent: 0, opacity: 1 });
      return;
    }

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      const isEyebrow = target.dataset.revealType === "eyebrow";

      gsap.set(target, isEyebrow
        ? { y: MOTION.eyebrowReveal.y, opacity: 0 }
        : { yPercent: MOTION.titleReveal.yPercent, opacity: 0 },
      );

      const tweenVars = isEyebrow
        ? {
            y: 0,
            opacity: 1,
            duration: MOTION.eyebrowReveal.duration,
            delay: delay / 1000,
            ease: MOTION.eyebrowReveal.ease,
          }
        : {
            yPercent: 0,
            opacity: 1,
            duration: MOTION.titleReveal.duration,
            delay: delay / 1000,
            ease: MOTION.titleReveal.ease,
          };

      if (animateOnMount) {
        gsap.to(target, tweenVars);
        return;
      }

      gsap.to(target, {
        ...tweenVars,
        scrollTrigger: {
          trigger: mask,
          start: MOTION.titleReveal.start,
          once: true,
        },
      });
    }, mask);

    return () => ctx.revert();
  }, [maskRef, targetRef, delay, animateOnMount, disabled, reducedMotion, pathname]);
}
