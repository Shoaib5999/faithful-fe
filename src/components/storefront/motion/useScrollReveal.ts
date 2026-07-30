import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type ScrollRevealDirection = "up" | "down" | "left" | "right" | "none";

type UseScrollRevealOptions = {
  delay?: number;
  direction?: ScrollRevealDirection;
  disabled?: boolean;
};

function getAxisOffset(direction: ScrollRevealDirection): { x: number; y: number } {
  switch (direction) {
    case "down":
      return { x: 0, y: -MOTION.reveal.y };
    case "left":
      return { x: MOTION.reveal.y, y: 0 };
    case "right":
      return { x: -MOTION.reveal.y, y: 0 };
    case "none":
      return { x: 0, y: 0 };
    case "up":
    default:
      return { x: 0, y: MOTION.reveal.y };
  }
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {},
) {
  const { delay = 0, direction = "up", disabled = false } = options;
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const { x, y } = getAxisOffset(direction);

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }

    gsap.set(el, { opacity: 0, x, y });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: MOTION.duration.slow,
          delay: delay / 1000,
          ease: MOTION.ease.premium,
        });
        observer.disconnect();
      },
      { threshold: MOTION.reveal.threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, disabled, reducedMotion]);

  return ref;
}
