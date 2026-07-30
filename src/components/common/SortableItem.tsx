import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: string;
  children: (props: {
    listeners: ReturnType<typeof useSortable>["listeners"];
    attributes: ReturnType<typeof useSortable>["attributes"];
    isDragging: boolean;
  }) => React.ReactNode;
  className?: string;
}

export const dragOverlayStyles: React.CSSProperties = {
  opacity: 0.85,
  boxShadow: "var(--shadow-lg)",
  borderRadius: "var(--radius-md)",
};

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(className)}>
      {children({ listeners, attributes, isDragging })}
    </div>
  );
};
