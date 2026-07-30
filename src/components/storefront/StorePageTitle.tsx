import { storeContainerClass } from "@/components/storefront/storefront-ui";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { cn } from "@/lib/utils";

type StorePageTitleProps = {
  title: string;
  eyebrow?: string;
};

export function StorePageTitle({ title, eyebrow }: StorePageTitleProps) {
  return (
    <div className="border-b border-black/8 bg-white">
      <div className={cn(storeContainerClass, "py-10 md:py-12")}>
        {eyebrow ? (
          <RevealText className="mb-2 text-center store-text-eyebrow text-[var(--store-red)]">
            {eyebrow}
          </RevealText>
        ) : null}
        <RevealTitle
          as="h1"
          className="text-center  text-2xl font-normal uppercase tracking-[0.08em] text-[var(--store-red)] md:text-3xl"
        >
          {title}
        </RevealTitle>
        <div className="store-heading-underline mt-4" aria-hidden data-reveal-text />
      </div>
    </div>
  );
}
