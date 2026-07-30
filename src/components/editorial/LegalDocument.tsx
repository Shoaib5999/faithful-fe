import { cn } from "@/lib/utils";
import {
  storeContainerClass,
  storePageSectionClass,
} from "@/components/storefront/storefront-ui";

export interface LegalSection {
  id: string;
  title: string;
  body: string | string[];
}

interface Props {
  sections: LegalSection[];
  className?: string;
}

export function LegalDocument({ sections, className = "" }: Props) {
  return (
    <div
      className={cn(
        storeContainerClass,
        storePageSectionClass,
        "flex flex-col gap-10 md:gap-12",
        className,
      )}
    >
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <h2 className="mb-4  text-xl font-bold uppercase tracking-wide text-[#1a1a1a] md:text-2xl">
            {section.title}
          </h2>
          {Array.isArray(section.body) ? (
            <div className="flex flex-col gap-4">
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="max-w-[72ch] font-store-body text-sm leading-relaxed text-[#6b6b6b] md:text-base"
                >
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="max-w-[72ch] font-store-body text-sm leading-relaxed text-[#6b6b6b] md:text-base">
              {section.body}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
