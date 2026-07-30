import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { DragHandle } from "@/components/common/DragHandle";
import { SortableItem } from "@/components/common/SortableItem";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCutType } from "@/hooks/useCutType";
import { useModal } from "@/hooks/useModal";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const CutTypesSection: React.FC = () => {
  const { types, loadTypes, handleReorder, confirmDelete } = useCutType();
  const { openModal } = useModal();
  const activeTypes = types.filter((type) => type.isActive);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = activeTypes.findIndex((t) => t.id === active.id);
    const newIdx = activeTypes.findIndex((t) => t.id === over.id);
    const next = [...activeTypes];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, moved);
    void handleReorder(next.map((t) => t.id));
  };

  const openTypeModal = (type?: (typeof types)[0]) => {
    openModal("CutTypeCreateEdit", {
      cutType: type,
      onSaved: () => {
        void loadTypes();
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Cut Types"
        subtitle="Theme images for homepage discovery (first 6 by order). Also used on products as cut tags — do not rename existing types in production."
        actions={
          <PermissionGate moduleKey="settings" operation="manage">
            <Button size="sm" onClick={() => openTypeModal()}>
              <Plus className="mr-1 h-4 w-4" /> Add type
            </Button>
          </PermissionGate>
        }
      />

      {activeTypes.length === 0 ? (
        <EmptyState
          title="No cut types"
          description="Add types with theme images for homepage discovery and product filters"
          icon={Layers}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeTypes.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {activeTypes.map((type, index) => (
                <SortableItem key={type.id} id={type.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                      <DragHandle listeners={listeners} attributes={attributes} />
                      <Avatar className="h-10 w-10 rounded-full">
                        {type.imageUrl ? (
                          <AvatarImage src={type.imageUrl} alt={type.name} />
                        ) : null}
                        <AvatarFallback className="rounded-full text-xs">
                          {type.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{type.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {index < 6 ? `Homepage slot ${index + 1}` : "Not shown on homepage"}
                          {!type.imageUrl ? " · No image" : ""}
                        </p>
                      </div>
                      <StatusBadge
                        status={type.isActive ? "Active" : "Inactive"}
                        colorMap={ACTIVE_COLOR}
                      />
                      <PermissionGate moduleKey="settings" operation="manage">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openTypeModal(type)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(type)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </PermissionGate>
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
