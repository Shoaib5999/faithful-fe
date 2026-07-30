export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.3,
    slow: 0.6,
  },
  ease: {
    out: "power2.out",
    premium: "power3.out",
  },
  reveal: {
    y: 24,
    stagger: 0.08,
    threshold: 0.12,
  },
  titleReveal: {
    yPercent: 110,
    duration: 1,
    ease: "expo.out",
    start: "top 78%",
  },
  eyebrowReveal: {
    y: 10,
    duration: 0.8,
    ease: "expo.out",
    leadTime: 0.1,
  },
  wordReveal: {
    stagger: 0.06,
    duration: 1,
    ease: "expo.out",
    yPercent: 0,
  },
  bodyReveal: {
    y: 16,
    duration: 0.9,
    delay: 0.2,
    ease: "expo.out",
  },
  carouselEntrance: {
    x: 40,
    duration: 0.9,
    ease: "expo.out",
  },
  clipReveal: {
    from: "inset(6% 0% 6% 0%)",
    to: "inset(0%)",
    duration: 1.6,
    ease: "expo.inOut",
  },
} as const;
