import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapBodyReveal } from "@/components/storefront/motion/useGsapBodyReveal";
import type { StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import { cn } from "@/lib/utils";

type StoreSectionHeaderProps = {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  align?: "center" | "start";
  theme?: StoreSectionTheme;
  viewAllHref?: string;
  viewAllLabel?: string;
  showUnderline?: boolean;
  className?: string;
};

export function StoreSectionHeader({
  id,
  title,
  eyebrow,
  subtitle,
  align = "center",
  theme = "light",
  viewAllHref,
  viewAllLabel = "View all",
  showUnderline = true,
  className,
}: StoreSectionHeaderProps) {
  const isCenter = align === "center";
  const onLightSurface = theme === "light" || theme === "red" || theme === "dark";
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useGsapBodyReveal(subtitleRef, headerRef, { disabled: !subtitle });

  const viewAllLink = viewAllHref ? (
    <Link
      to={viewAllHref}
      className={cn(
        "group inline-flex shrink-0 items-center gap-1.5 font-store-body text-xs uppercase tracking-[0.32em] transition-colors hover:text-[var(--store-red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--store-red)]",
        onLightSurface ? "text-[var(--store-ink)]" : "text-white/55",
        isCenter && "mt-5",
      )}
    >
      {viewAllLabel}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  ) : null;

  if (!isCenter) {
    return (
      <header ref={headerRef} className={cn("mb-8 w-full text-left md:mb-16", className)}>
        <div className="min-w-0">
          {eyebrow ? (
            <RevealText
              delay={0}
              variant="eyebrow"
              className="font-store-body text-xs font-semibold uppercase tracking-[0.32em] text-[var(--store-red-dark)]"
            >
              {eyebrow}
            </RevealText>
          ) : null}
          <RevealWordTitle
            as="h2"
            id={id}
            className={cn(
              "font-display text-[clamp(1.5rem,5vw,3.25rem)] font-normal leading-[1.08] tracking-wide",
              onLightSurface ? "text-[var(--store-ink)]" : "text-white",
              eyebrow && "mt-1.5",
            )}
          >
            {title}
          </RevealWordTitle>
          {subtitle ? (
            <p
              ref={subtitleRef}
              className={cn(
                "mt-1.5 max-w-xl font-store-body text-[13px] leading-[1.65]",
                onLightSurface ? "text-[var(--store-muted)]" : "text-white/55",
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {viewAllLink ? <div className="mt-3">{viewAllLink}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header
      ref={headerRef}
      className={cn("mb-12 text-center md:mb-16", className)}
    >
      <div>
        {eyebrow ? (
          <RevealText
            delay={0}
            variant="eyebrow"
            className="font-store-body text-[12px] uppercase tracking-[0.42em] text-[var(--store-red)]"
          >
            {eyebrow}
          </RevealText>
        ) : null}
        <RevealWordTitle
          as="h2"
          id={id}
          className={cn(
            "font-display text-[clamp(1.75rem,4vw,3.25rem)] font-normal leading-[1.06] tracking-wide",
            onLightSurface ? "text-[var(--store-ink)]" : "text-white",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </RevealWordTitle>
        {subtitle ? (
          <p
            ref={subtitleRef}
            className={cn(
              "mx-auto mt-3 max-w-2xl font-store-body text-[15px] leading-[1.85]",
              onLightSurface ? "text-[var(--store-muted)]" : "text-white/55",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {showUnderline ? (
          <div className="store-heading-underline mt-4" aria-hidden />
        ) : null}
      </div>

      {viewAllLink}
    </header>
  );
}
