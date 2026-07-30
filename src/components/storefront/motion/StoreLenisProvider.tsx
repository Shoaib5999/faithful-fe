import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import type Lenis from "lenis";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/components/storefront/motion/gsap";
import { useReducedMotion } from "@/components/storefront/motion/useReducedMotion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

function LenisScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    ensureGsapPlugins();
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(onTick);
      delete window.__lenis;
    };
  }, [lenis]);

  return null;
}

type StoreLenisProviderProps = {
  children: ReactNode;
};

/** Minimal Lenis smooth scroll for the storefront — synced with GSAP ScrollTrigger. */
export function StoreLenisProvider({ children }: StoreLenisProviderProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
      }}
    >
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
