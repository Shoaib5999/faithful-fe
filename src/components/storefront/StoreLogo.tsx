import { Link } from "react-router-dom";
import faithfulMeatLogo from "@/assets/brand/faithful-meat-logo-circle.png";
import { cn } from "@/lib/utils";

type StoreLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_STYLES: Record<NonNullable<StoreLogoProps["size"]>, string> = {
  sm: "h-8 w-auto sm:h-9",
  md: "h-9 w-auto sm:h-10 md:h-11",
  lg: "h-10 w-auto sm:h-11 md:h-12 lg:h-[3.25rem]",
};

export function StoreLogo({ className, size = "md" }: StoreLogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex shrink-0 items-center justify-center select-none transition-transform duration-200 hover:scale-[1.18] scale-[1.15]",
        className,
      )}
      aria-label="Faithful Meat home"
    >
      <img
        src={faithfulMeatLogo}
        alt="Faithful Meat"
        width={682}
        height={702}
        className={cn(
          "object-contain object-center transition-opacity duration-200 group-hover:opacity-85",
          SIZE_STYLES[size],
        )}
        draggable={false}
      />
    </Link>
  );
}
