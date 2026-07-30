import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { DragHandle } from "@/components/common/DragHandle";
import { SortableItem } from "@/components/common/SortableItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { filterActiveOrderStatuses } from "@/lib/order-display";
import { useModal } from "@/hooks/useModal";
import { STATUS_VARIANT_BORDER_CLASS } from "@/lib/status-colors";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

export const OrderStatusesSection: React.FC = () => {
  const { orderStatuses, confirmDelete, handleReorder } = useOrderStatus();
  const { openModal } = useModal();
  const activeOrderStatuses = filterActiveOrderStatuses(orderStatuses);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = activeOrderStatuses.findIndex((s) => s.id === active.id);
    const newIdx = activeOrderStatuses.findIndex((s) => s.id === over.id);
    const next = [...activeOrderStatuses];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, moved);
    handleReorder(next.map((s) => s.id));
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Order Statuses"
       actions={<Button size="sm" onClick={() => openModal("OrderStatusCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Status</Button>} />
      {activeOrderStatuses.length === 0 ? (
        <EmptyState title="No order statuses" description="Add your first order status" />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeOrderStatuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {activeOrderStatuses.map((status) => (
                <SortableItem key={status.id} id={status.id}>
                  {({ listeners, attributes }) => (
                    <div className={`flex items-center gap-3 rounded-md border border-border bg-card p-3 border-l-4 ${STATUS_VARIANT_BORDER_CLASS[status.color]}`}>
                      <DragHandle listeners={listeners} attributes={attributes} />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm">{status.label}</span>
                        <span className="ml-2  text-xs text-muted-foreground">{status.code}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {status.isDefault && <Badge variant="secondary">Default</Badge>}
                        {status.isFinal && <Badge variant="outline">Final</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal("OrderStatusCreateEdit", { orderStatus: status })}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(status)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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