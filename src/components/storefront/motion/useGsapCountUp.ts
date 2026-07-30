import { useLayoutEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { MOTION } from "@/components/storefront/motion/motion.config";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

type UseGsapCountUpOptions = {
  endValue: number;
  suffix?: string;
  duration?: number;
  disabled?: boolean;
};

export function useGsapCountUp<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  triggerRef: RefObject<HTMLElement | null>,
  options: UseGsapCountUpOptions,
) {
  const { endValue, suffix = "", duration = 1.6, disabled = false } = options;
  const reducedMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const el = elementRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger || disabled) return;

    if (reducedMotion) {
      el.textContent = `${endValue}${suffix}`;
      return;
    }

    ensureGsapPlugins();

    const counter = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: endValue,
        duration,
        ease: "expo.out",
        scrollTrigger: {
          trigger,
          start: MOTION.titleReveal.start,
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${Math.round(counter.value)}${suffix}`;
        },
      });
    }, trigger);

    return () => ctx.revert();
  }, [elementRef, triggerRef, endValue, suffix, duration, disabled, reducedMotion, pathname]);
}

export function parseStatValue(value: string): { number: number; suffix: string } {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { number: 0, suffix: value };
  return { number: parseFloat(match[1]), suffix: match[2] };
}
