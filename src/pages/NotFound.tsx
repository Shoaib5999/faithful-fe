import { Compass } from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import {
  StorePageContainer,
  StorePrimaryLink,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <StorePageShell>
      <StorePageContainer
        className={cn(
          storePageSectionClass,
          "flex min-h-[55vh] flex-col items-center justify-center text-center",
        )}
      >
        <div className={cn(storePanelClass, "mx-auto max-w-lg px-8 py-20 md:px-12 md:py-24")}>
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--store-cream)]">
            <Compass className="h-7 w-7 text-[var(--store-red)]" strokeWidth={1.5} aria-hidden />
          </span>
          <p className=" text-5xl font-bold text-[var(--store-red)] md:text-6xl">404</p>
          <RevealTitle
            as="h1"
            className="mt-4  text-xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-2xl"
          >
            Page not found
          </RevealTitle>
          <p className="mx-auto mt-4 max-w-sm font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
            The page you are looking for does not exist or may have moved.
          </p>
          <StorePrimaryLink to="/" className="mt-10 px-10">
            Back to home
          </StorePrimaryLink>
        </div>
      </StorePageContainer>
    </StorePageShell>
  );
}
