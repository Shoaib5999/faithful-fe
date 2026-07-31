import { createPortal } from "react-dom";
import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
  type ComponentType,
} from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, type LucideProps } from "lucide-react";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { cn } from "@/lib/utils";

/** Shared max-width + horizontal padding for storefront pages and home sections */
export const storeContainerClass = "mx-auto max-w-[1400px] px-4 md:px-8 xl:px-12";

/** Standard vertical rhythm below `StorePageTitle` */
export const storePageSectionClass = "pt-8 md:pt-10 pb-16 md:pb-24";

export const storePageBottomClass = "pb-16 md:pb-24";

export const storeProductGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 xl:grid-cols-4 xl:gap-4";

export const storePanelClass =
  "rounded-lg border border-black/10 bg-white shadow-[var(--store-shadow-sm)]";

export const storeGoldCtaClass =
  "store-red-shimmer store-btn-press inline-flex cursor-pointer items-center justify-center rounded-md border border-[var(--store-red-dark)] bg-gradient-to-r from-[#d4b87a] via-[#b8954a] to-[#c9a050] px-10 py-3.5 font-store-body text-xs font-bold uppercase tracking-[0.16em] text-[var(--store-ink)] shadow-[var(--store-shadow-md)] transition-[transform,box-shadow,opacity] duration-300 hover:shadow-[var(--store-shadow-lg)] hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]";

export const storeExploreCollectionClass =
  "store-btn-press inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--store-red)] bg-[var(--store-red)]/15 px-5 py-3 font-store-body text-xs font-semibold uppercase tracking-[0.16em] text-[var(--store-red-dark)] transition-all duration-500 hover:border-[var(--store-red-dark)] hover:bg-[var(--store-red)]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)] sm:w-auto sm:justify-start sm:self-start sm:px-6";

export const storeFieldLabelClass =
  "font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)]";

export const storeFieldInputClass =
  "w-full rounded-md border border-black/15 bg-white px-4 py-3 font-store-body text-sm text-[var(--store-ink)] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[var(--store-red)] focus:shadow-[0_0_0_3px_rgba(184,149,74,0.12)]";

const storeBtnBase =
  "store-btn-press cursor-pointer rounded-md font-store-body text-xs font-semibold uppercase tracking-[0.14em] transition-[transform,opacity,box-shadow,background-color,border-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

const storePrimaryActionClass =
  "inline-flex items-center justify-center bg-[var(--store-red-dark)] px-6 py-2.5 text-[#ffffff] shadow-[var(--store-shadow-sm)] hover:bg-[var(--store-red)] hover:shadow-[var(--store-shadow-md)] focus-visible:outline-[var(--store-red)]";

const getLenis = () =>
  (window as Window & { __lenis?: { stop: () => void; start: () => void } }).__lenis ?? null;

/** Lock body scroll while a storefront modal is open (Lenis-aware). */
export function useStoreBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    getLenis()?.stop();
    const scrollY = window.scrollY;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      getLenis()?.start();
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      document.body.style.overflow = prevBodyOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

/** Render modals on document.body with storefront theme tokens. */
export function StoreModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(<div className="storefront">{children}</div>, document.body);
}

export function StorePageContainer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(storeContainerClass, className)} {...props} />;
}

export function StoreEyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("store-text-eyebrow", className)} {...props} />;
}

export function StoreSectionTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      <RevealTitle
        as="h2"
        className=" text-xl font-normal tracking-wide text-[var(--store-ink)] md:text-2xl"
      >
        {title}
      </RevealTitle>
      {subtitle ? (
        <RevealText
          as="p"
          delay={100}
          className="mt-2 max-w-2xl font-store-body text-sm leading-relaxed text-[var(--store-muted)]"
        >
          {subtitle}
        </RevealText>
      ) : null}
    </div>
  );
}

export function StoreGoldCtaLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(storeGoldCtaClass, className)} {...props} />;
}

export function StorePrimaryButton({ className, ...props }: ComponentProps<"button">) {
  return <button className={cn(storeBtnBase, storePrimaryActionClass, className)} {...props} />;
}

export function StorePrimaryLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(storeBtnBase, storePrimaryActionClass, className)} {...props} />;
}

export function StoreExploreCollectionLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(storeExploreCollectionClass, className)} {...props}>
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
    </Link>
  );
}

export function StoreGhostButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        storeBtnBase,
        "border border-[var(--store-red-dark)] px-5 py-2 text-[10px] tracking-[0.12em] text-[var(--store-red-dark)] hover:bg-[var(--store-red-dark)] hover:text-white focus-visible:outline-[var(--store-red)]",
        className,
      )}
      {...props}
    />
  );
}

export function StoreFormLabel({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn(storeFieldLabelClass, className)} {...props} />;
}

export function StoreInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(storeFieldInputClass, className)} {...props} />;
}

export function StoreTextarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(storeFieldInputClass, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

/** Product/category photo that falls back to a centered icon on load error (avoids broken-image glyphs). */
export function StoreImageWithFallback({
  src,
  alt,
  icon: Icon,
  className,
  iconClassName,
}: {
  src: string;
  alt: string;
  icon: ComponentType<LucideProps>;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[var(--store-cream)]",
          className,
        )}
      >
        <Icon
          className={cn("h-10 w-10 text-[var(--store-red)]/40", iconClassName)}
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

/* ── Skeleton primitives ── */

export function StoreSkeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("store-skeleton", className)} aria-hidden {...props} />;
}

export function StoreSkeletonText({
  className,
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <StoreSkeleton
          key={i}
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function StoreSkeletonProductCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white",
        className,
      )}
      aria-hidden
    >
      <StoreSkeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 px-3 py-4">
        <StoreSkeleton className="mx-auto h-3.5 w-3/4" />
        <StoreSkeleton className="mx-auto h-2.5 w-1/2" />
        <div className="flex justify-center gap-1.5">
          <StoreSkeleton className="h-6 w-10" />
          <StoreSkeleton className="h-6 w-10" />
          <StoreSkeleton className="h-6 w-10" />
        </div>
        <StoreSkeleton className="mx-auto h-4 w-1/3" />
        <StoreSkeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function StoreSkeletonGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(storeProductGridClass, className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <StoreSkeletonProductCard key={i} />
      ))}
    </div>
  );
}
