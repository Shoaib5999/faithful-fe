import React from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { DragHandle } from "@/components/common/DragHandle";
import { SortableItem } from "@/components/common/SortableItem";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSlider } from "@/hooks/useSlider";
import { useModal } from "@/hooks/useModal";
import { formatDate } from "@/lib/formatters";
import type { ColorVariant } from "@/types/common.types";
import { SLIDER_IMAGE_SPECS } from "@/constants/cms.constants";
import { Plus, Pencil, Trash2, GalleryHorizontal, Power } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const CmsSlidersPanel: React.FC = () => {
  const { sliders, loadSliders, handleUpdate, handleReorder, confirmDelete } = useSlider();
  const { openModal } = useModal();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sliders.findIndex((s) => s.id === active.id);
    const newIdx = sliders.findIndex((s) => s.id === over.id);
    const next = [...sliders];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, moved);
    handleReorder(next.map((s) => s.id));
  };

  const toggleActive = (slider: (typeof sliders)[0]) => {
    handleUpdate(slider.id, { isActive: !slider.isActive });
  };

  const openSliderModal = (slider?: (typeof sliders)[0]) => {
    openModal("SliderCreateEdit", {
      slider,
      onSaved: () => {
        void loadSliders();
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{SLIDER_IMAGE_SPECS.desktop.label}</span>{" "}
          {SLIDER_IMAGE_SPECS.desktop.width}×{SLIDER_IMAGE_SPECS.desktop.height} ({SLIDER_IMAGE_SPECS.desktop.ratio})
          <span className="mx-1.5 text-border">·</span>
          <span className="font-medium text-foreground">{SLIDER_IMAGE_SPECS.mobile.label}</span>{" "}
          {SLIDER_IMAGE_SPECS.mobile.width}×{SLIDER_IMAGE_SPECS.mobile.height} ({SLIDER_IMAGE_SPECS.mobile.ratio})
        </p>
        <PermissionGate moduleKey="cms" operation="create">
          <Button size="sm" className="shrink-0" onClick={() => openSliderModal()}>
            <Plus className="mr-1 h-4 w-4" /> Add Slider
          </Button>
        </PermissionGate>
      </div>

      {sliders.length === 0 ? (
        <EmptyState
          title="No sliders"
          description="Create your first homepage slider"
          icon={GalleryHorizontal}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sliders.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sliders.map((slider) => (
                <SortableItem key={slider.id} id={slider.id}>
                  {({ listeners, attributes }) => (
                    <div className="group overflow-hidden rounded-xl border border-border bg-card">
                      <div className="relative">
                        <AspectRatio ratio={21 / 9}>
                          {slider.imageUrl || slider.imageUrlMobile ? (
                            <img
                              src={slider.imageUrl ?? slider.imageUrlMobile ?? ""}
                              alt={slider.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <span className="text-lg font-semibold text-primary">{slider.title}</span>
                            </div>
                          )}
                        </AspectRatio>
                        <div className="absolute left-2 top-2 z-10">
                          <DragHandle listeners={listeners} attributes={attributes} />
                        </div>
                        <div className="absolute right-2 top-2 z-10 flex gap-1">
                          <PermissionGate moduleKey="cms" operation="edit">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openSliderModal(slider)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate moduleKey="cms" operation="delete">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => confirmDelete(slider)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </PermissionGate>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span className="block text-sm font-bold text-white">{slider.title}</span>
                          <span className="block text-xs text-white/80">{slider.subtitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <StatusBadge
                          status={slider.isActive ? "Active" : "Inactive"}
                          colorMap={ACTIVE_COLOR}
                        />
                        {slider.imageUrlMobile && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Mobile image set
                          </span>
                        )}
                        {slider.startDate && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(slider.startDate)}
                          </span>
                        )}
                        {slider.endDate && (
                          <span className="text-xs text-muted-foreground">
                            – {formatDate(slider.endDate)}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-6 w-6"
                          onClick={() => toggleActive(slider)}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
