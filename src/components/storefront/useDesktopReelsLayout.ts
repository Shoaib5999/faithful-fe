import { useEffect, useState } from "react";

const DESKTOP_REELS_MQ = "(min-width: 768px)";

/** md+ = desktop reel row (hover emphasis); below = mobile swipe carousel */
export function useDesktopReelsLayout() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_REELS_MQ).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_REELS_MQ);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
