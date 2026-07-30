import { useEffect, useRef } from "react";

type UseIntersectionLoadMoreOptions = {
  enabled?: boolean;
  rootMargin?: string;
};

/** Calls `onIntersect` when the returned ref enters (or nears) the viewport. */
export function useIntersectionLoadMore(
  onIntersect: () => void,
  { enabled = true, rootMargin = "240px" }: UseIntersectionLoadMoreOptions = {},
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
