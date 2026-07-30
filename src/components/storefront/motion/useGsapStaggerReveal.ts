import { useEffect, useRef } from "react";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapStaggerRevealOptions = {
  selector?: string;
  delay?: number;
  disabled?: boolean;
};

export function useGsapStaggerReveal<T extends HTMLElement>(
  options: UseGsapStaggerRevealOptions = {},
) {
  const { selector = "[data-reveal-text]", delay = 0, disabled = false } = options;
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || disabled) return;

    const targets = root.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    ensureGsapPlugins();

    gsap.set(targets, { opacity: 0, y: MOTION.reveal.y });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: MOTION.titleReveal.duration,
        delay: delay / 1000,
        stagger: MOTION.reveal.stagger,
        ease: MOTION.titleReveal.ease,
        scrollTrigger: {
          trigger: root,
          start: MOTION.titleReveal.start,
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [selector, delay, disabled, reducedMotion]);

  return ref;
}
