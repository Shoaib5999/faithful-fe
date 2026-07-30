import React from "react";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { CMS_CATEGORY_SLOTS } from "@/constants/cms.constants";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon } from "lucide-react";

const GROUP_LABELS = {
  categories: "Product Categories",
} as const;

export const CmsCategoriesPanel: React.FC = () => {
  const groups = ["categories"] as const;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Homepage category images preview. Editing will be wired in a later update.
      </p>

      {groups.map((group) => {
        const slots = CMS_CATEGORY_SLOTS.filter((slot) => slot.group === group);

        return (
          <section key={group} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{GROUP_LABELS[group]}</h3>
              <Badge variant="secondary">Coming soon</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {slots.map((slot) => {
                const imageUrl = CATEGORY_R2_IMAGES[slot.imageKey];

                return (
                  <div
                    key={slot.key}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <AspectRatio ratio={3 / 4}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={slot.label}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </AspectRatio>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{slot.label}</p>
                      <p className="text-xs text-muted-foreground">R2 / categories</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
