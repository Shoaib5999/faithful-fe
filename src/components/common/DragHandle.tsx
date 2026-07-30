import React from "react";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";

interface DragHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
  className?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  listeners,
  attributes,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("cursor-grab active:cursor-grabbing h-8 w-8", className)}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
};
