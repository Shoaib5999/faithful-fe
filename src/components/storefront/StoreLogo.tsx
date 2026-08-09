import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type StoreLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_STYLES: Record<NonNullable<StoreLogoProps["size"]>, string> = {
  sm: "h-14 w-14 sm:h-16 sm:w-16",
  md: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20",
  lg: "h-20 w-20 sm:h-[5.5rem] sm:w-[5.5rem] md:h-24 md:w-24",
};

export function StoreLogo({ className, size = "md" }: StoreLogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex shrink-0 items-center justify-center select-none",
        className,
      )}
      aria-label="Faithful Meat home"
    >
      <img
        src="/images/logo-faithful-meat.png"
        alt="Faithful Meat — Fresh. Hygienic. Trusted."
        className={cn("object-contain object-center", SIZE_STYLES[size])}
      />
    </Link>
  );
}
