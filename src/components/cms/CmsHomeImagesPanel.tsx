import React from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { useHomeImage } from "@/hooks/useHomeImage";
import { useModal } from "@/hooks/useModal";
import { CMS_HOME_IMAGE_SECTIONS } from "@/constants/cms.constants";
import type { ColorVariant } from "@/types/common.types";
import type { HomeImage } from "@/types/cms.types";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

const getImageSpecsHint = (sectionKey: HomeImage["section"]) => {
  if (sectionKey === "promo-banners") return "1600×1100 px (16:11)";
  if (sectionKey === "brand-intro") return "1600×1200 px (4:3)";
  return "900×1200 px (3:4)";
};

export const CmsHomeImagesPanel: React.FC = () => {
  const { homeImages, isLoading, loadHomeImages, confirmDelete } = useHomeImage();
  const { openModal } = useModal();

  const openEditModal = (item: HomeImage) => {
    openModal("HomeImageEdit", {
      homeImage: item,
      onSaved: () => {
        void loadHomeImages();
      },
    });
  };

  const openCreateModal = (section: HomeImage["section"]) => {
    openModal("HomeImageEdit", {
      section,
      onSaved: () => {
        void loadHomeImages();
      },
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading homepage images…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {CMS_HOME_IMAGE_SECTIONS.map((section) => {
        const items = homeImages
          .filter((item) => item.section === section.key)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <section key={section.key} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">{section.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
              </div>
              <PermissionGate moduleKey="cms" operation="create">
                <Button variant="outline" size="sm" onClick={() => openCreateModal(section.key)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Tile
                </Button>
              </PermissionGate>
            </div>

            <div
              className={
                section.key === "promo-banners" || section.key === "brand-intro"
                  ? "grid grid-cols-1 gap-4 md:max-w-xl"
                  : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              }
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="relative">
                    <AspectRatio ratio={section.aspectRatio}>
                      {item.imageUrl || item.imageUrlMobile ? (
                        <img
                          src={item.imageUrl ?? item.imageUrlMobile ?? ""}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">No image set</span>
                        </div>
                      )}
                    </AspectRatio>

                    <div className="absolute right-2 top-2 flex gap-1.5">
                      <PermissionGate moduleKey="cms" operation="edit">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate moduleKey="cms" operation="delete">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => confirmDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>

                  <div className="space-y-2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <StatusBadge
                        status={item.isActive ? "Active" : "Inactive"}
                        colorMap={ACTIVE_COLOR}
                      />
                    </div>
                    {item.subtitle ? (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    ) : null}
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {getImageSpecsHint(item.section)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
