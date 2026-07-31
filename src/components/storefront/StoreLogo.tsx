import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type StoreLogoProps = {
  className?: string;
  /** "dark" = for light backgrounds (dark wordmark). "light" = for dark backgrounds (white wordmark). */
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
};

const SIZE_STYLES: Record<NonNullable<StoreLogoProps["size"]>, string> = {
  sm: "h-8 w-auto sm:h-9",
  md: "h-9 w-auto sm:h-10 md:h-11",
  lg: "h-11 w-auto sm:h-12 md:h-14 lg:h-16",
};

export function StoreLogo({
  className,
  variant = "dark",
  size = "md",
  tagline = false,
}: StoreLogoProps) {
  const wordmarkFill = variant === "light" ? "#ffffff" : "var(--store-ink)";
  const taglineFill = variant === "light" ? "rgba(255,255,255,0.75)" : "var(--store-muted)";

  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex shrink-0 items-center justify-center select-none",
        className,
      )}
      aria-label="Faithful Meat home"
    >
      <svg
        viewBox="0 0 258 124"
        className={cn("object-contain object-center", SIZE_STYLES[size])}
        role="img"
        aria-label="Faithful Meat"
      >
        <g fill="var(--store-red)">
          <circle cx="32" cy="40" r="17" />
          <rect x="40" y="47" width="7" height="23" rx="3.5" transform="rotate(45 43.5 58.5)" />
          <circle cx="57" cy="72" r="5.5" />
        </g>
        <text
          x="76"
          y="50"
          fontFamily="Poppins, Arial, sans-serif"
          fontWeight="800"
          fontSize="28"
          letterSpacing="0.5"
          fill={wordmarkFill}
        >
          FAITHFUL
        </text>
        <text
          x="76"
          y="80"
          fontFamily="Poppins, Arial, sans-serif"
          fontWeight="800"
          fontSize="28"
          letterSpacing="2"
          fill="var(--store-red)"
        >
          MEAT
        </text>
        {tagline ? (
          <text
            x="76"
            y="99"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="600"
            fontSize="9"
            letterSpacing="1.6"
            fill={taglineFill}
          >
            FRESH &amp; QUALITY MEAT
          </text>
        ) : null}
      </svg>
    </Link>
  );
}
