import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapWordRevealOptions = {
  animateOnMount?: boolean;
  disabled?: boolean;
};

export function useGsapWordReveal<T extends HTMLElement>(
  containerRef: RefObject<HTMLElement | null>,
  options: UseGsapWordRevealOptions = {},
) {
  const { animateOnMount = false, disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const words = container.querySelectorAll<HTMLElement>(".word-inner");
    if (!words.length) return;

    if (reducedMotion) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: MOTION.wordReveal.yPercent, opacity: 1 });

      const tweenVars = {
        yPercent: 0,
        duration: MOTION.wordReveal.duration,
        stagger: MOTION.wordReveal.stagger,
        ease: MOTION.wordReveal.ease,
      };

      if (animateOnMount) {
        gsap.to(words, tweenVars);
        return;
      }

      gsap.to(words, {
        ...tweenVars,
        scrollTrigger: {
          trigger: container,
          start: MOTION.titleReveal.start,
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [containerRef, animateOnMount, disabled, reducedMotion, pathname]);
}
