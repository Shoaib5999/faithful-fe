import { useState, type MouseEvent } from "react";
import { ArrowUpRight, Instagram } from "lucide-react";
import { INSTAGRAM } from "@/constants/storefront.constants";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import {
  buildReviewPilePositions,
  buildReviewShowcaseCards,
  type ReviewPilePosition,
  type ReviewShowcaseCard,
} from "@/lib/review-showcase";
import { cn } from "@/lib/utils";

const SHOWCASE_CARDS = buildReviewShowcaseCards();
const PILE_POSITIONS = buildReviewPilePositions(SHOWCASE_CARDS.length);

const HANDWRITTEN_LABEL = "'Caveat', 'Kalam', 'Bradley Hand', cursive" as const;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-px" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "text-[9px] leading-none",
            i < rating ? "text-[var(--store-red)]" : "text-black/15",
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ShowcaseCardTile({
  card,
  index,
  position,
  isActive,
  onToggle,
  onActivate,
  onDeactivate,
  layout,
}: {
  card: ReviewShowcaseCard;
  index: number;
  position: ReviewPilePosition;
  isActive: boolean;
  onToggle: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  layout: "pile" | "scroll";
}) {
  const expanded = isActive;
  const isScroll = layout === "scroll";

  const handleScrollClick = (event: MouseEvent) => {
    if (!isScroll) return;

    if (card.href && !expanded) {
      event.preventDefault();
      onActivate();
      return;
    }

    if (!card.href) {
      event.preventDefault();
      onToggle();
    }
  };

  const sharedProps = {
    className: cn(
      "group relative block bg-white p-2 shadow-[0_6px_24px_rgb(0,0,0,0.09)] border border-black/5 rounded-sm",
      "transition-[transform,box-shadow] duration-500 ease-out",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--store-red)]",
      layout === "pile" && [
        "md:absolute md:w-[142px] lg:w-[152px] xl:w-[162px]",
        "md:rotate-[var(--card-rotate)]",
        expanded
          ? "md:z-[100] md:scale-110 md:rotate-0 md:shadow-[0_24px_48px_rgb(0,0,0,0.16)]"
          : "md:z-[var(--card-layer)] md:hover:z-[100] md:hover:scale-110 md:hover:rotate-0 md:hover:shadow-[0_24px_48px_rgb(0,0,0,0.16)]",
      ],
      isScroll && [
        "w-[72vw] max-w-[230px] shrink-0 snap-center self-start",
        expanded && "relative z-20 shadow-[0_16px_36px_rgb(0,0,0,0.12)]",
      ],
    ),
    style:
      layout === "pile"
        ? ({
            ["--card-rotate" as string]: `${position.rotate}deg`,
            ["--card-layer" as string]: position.layer,
            top: position.top,
            left: position.left,
          } as React.CSSProperties)
        : undefined,
    onMouseEnter: isScroll ? undefined : onActivate,
    onMouseLeave: isScroll ? undefined : onDeactivate,
    onFocus: isScroll ? undefined : onActivate,
    onBlur: isScroll ? undefined : onDeactivate,
    onClick: isScroll ? handleScrollClick : undefined,
    "data-index": index,
  };

  const inner = (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[var(--store-muted)]">
        <img
          src={card.imageSrc}
          alt={card.alt}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {card.kind === "instagram" && (
          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <Instagram
              className="h-2.5 w-2.5 text-[var(--store-ink)]"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-2 flex min-h-[1.75rem] shrink-0 flex-col items-center bg-white px-1 pb-1">
        <span className="block w-full truncate text-center font-store-body text-[9px] uppercase tracking-[0.14em] text-[var(--store-ink)]">
          {card.displayName}
        </span>

        <div
          className={cn(
            "w-full overflow-hidden transition-[max-height,opacity,margin-top] duration-500 ease-out",
            isScroll
              ? expanded
                ? "mt-2 max-h-44 opacity-100"
                : "mt-0 max-h-0 opacity-0"
              : cn(
                  "grid transition-[grid-template-rows,opacity,margin-top] duration-500 ease-out",
                  expanded
                    ? "mt-1.5 grid-rows-[1fr] opacity-100"
                    : "mt-0 grid-rows-[0fr] opacity-0",
                  "group-hover:mt-1.5 group-hover:grid-rows-[1fr] group-hover:opacity-100",
                ),
          )}
        >
          <div className={cn(isScroll ? undefined : "overflow-hidden")}>
            <div className="flex flex-col items-center gap-1 pb-1">
              <span
                className="text-center text-xs leading-snug text-[var(--store-ink)] line-clamp-3"
                style={{ fontFamily: HANDWRITTEN_LABEL }}
              >
                {card.quote}
              </span>
              {card.kind === "review" && card.rating && <StarRow rating={card.rating} />}
              {card.location && (
                <span className="font-store-body text-[8px] uppercase tracking-[0.14em] text-[var(--store-muted)]">
                  {card.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (card.href) {
    return (
      <a
        {...sharedProps}
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${card.displayName} — ${INSTAGRAM.cta}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <article {...sharedProps} aria-label={`Review by ${card.displayName}`} aria-expanded={expanded}>
      {inner}
    </article>
  );
}

function ReviewPile({
  activeId,
  onActivate,
  onToggle,
  onDeactivate,
}: {
  activeId: string | null;
  onActivate: (id: string) => void;
  onToggle: (id: string) => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="relative md:h-[580px] lg:h-[620px] xl:h-[640px]">
      <p className="pointer-events-none absolute bottom-2 right-0 z-[105] hidden font-store-body text-[9px] uppercase tracking-[0.28em] text-[var(--section-fg-muted)] md:block">
        Hover to read
      </p>

      <div className="relative hidden h-full md:block">
        {SHOWCASE_CARDS.map((card, index) => (
          <ShowcaseCardTile
            key={card.id}
            card={card}
            index={index}
            position={PILE_POSITIONS[index]}
            isActive={activeId === card.id}
            onToggle={() => onToggle(card.id)}
            onActivate={() => onActivate(card.id)}
            onDeactivate={onDeactivate}
            layout="pile"
          />
        ))}
      </div>

      <div
        className="-mx-6 flex min-h-[22rem] items-start gap-4 overflow-x-auto overflow-y-visible px-6 pb-4 pt-2 snap-x snap-mandatory [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Customer reviews and Instagram moments"
      >
        {SHOWCASE_CARDS.map((card, index) => (
          <ShowcaseCardTile
            key={card.id}
            card={card}
            index={index}
            position={PILE_POSITIONS[index]}
            isActive={activeId === card.id}
            onToggle={() => onToggle(card.id)}
            onActivate={() => onActivate(card.id)}
            onDeactivate={onDeactivate}
            layout="scroll"
          />
        ))}
      </div>
    </div>
  );
}

type InstagramFollowSectionProps = {
  theme?: StoreSectionTheme;
};

export function InstagramFollowSection({ theme = "dark" }: InstagramFollowSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <StoreHomeSection
      theme={theme}
      compact
      className="overflow-visible md:overflow-hidden"
      aria-labelledby="instagram-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="md:grid md:grid-cols-[minmax(260px,340px)_1fr] md:items-center md:gap-x-10 lg:gap-x-14">
          <header className="relative z-20 mb-8 flex flex-col gap-6 md:mb-0">
            <div className="max-w-md">
              <RevealText className="font-store-body text-xs font-semibold uppercase tracking-[0.25em] text-[var(--store-red)]">
                Real voices
              </RevealText>
              <RevealTitle
                as="h2"
                id="instagram-heading"
                className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight text-[var(--section-fg)]"
              >
                Fresh from <br /> our kitchen
              </RevealTitle>
              <p className="mt-4 max-w-sm font-store-body text-sm leading-relaxed text-[var(--section-fg-muted)]">
                Scroll through real moments from our community — hover any card to read the full
                story behind it.
              </p>
              <p className="mt-3 font-store-body text-[10px] uppercase tracking-[0.22em] text-[var(--store-red)] md:hidden">
                Tap a card to read →
              </p>
            </div>

            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit shrink-0 items-center gap-3 border border-[var(--store-red)] px-6 py-3 font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--section-fg)]/80 transition-colors hover:bg-[var(--store-red)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--store-red)]"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {INSTAGRAM.cta}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </header>

          <ReviewPile
            activeId={activeId}
            onActivate={setActiveId}
            onToggle={(id) => setActiveId((prev) => (prev === id ? null : id))}
            onDeactivate={() => setActiveId(null)}
          />
        </div>
      </div>
    </StoreHomeSection>
  );
}
