import { StoreSectionHeader } from "@/components/storefront/StoreSectionHeader";
import type { StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import { cn } from "@/lib/utils";

type StoreProductSectionHeaderProps = {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  theme?: StoreSectionTheme;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
};

export function StoreProductSectionHeader(props: StoreProductSectionHeaderProps) {
  return (
    <StoreSectionHeader
      {...props}
      align="start"
      showUnderline={false}
      className={cn("w-full", props.className)}
    />
  );
}
