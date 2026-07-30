import { useEffect } from "react";

/**
 * Prefetch reel videos during idle time so the first taps play without buffering.
 * Limits count to avoid competing with critical homepage assets.
 */
export function useVideoReelPreload(urls: string[], count = 2) {
  useEffect(() => {
    const targets = urls.slice(0, Math.max(0, count));
    if (targets.length === 0) return;

    const links: HTMLLinkElement[] = [];

    const preload = () => {
      for (const url of targets) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = url;
        document.head.appendChild(link);
        links.push(link);
      }
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(preload, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(preload, 1200);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      for (const link of links) link.remove();
    };
  }, [urls, count]);
}
