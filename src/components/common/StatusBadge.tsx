import React from "react";
import { Badge } from "@/components/ui/badge";
import type { ColorVariant } from "@/types/common.types";
import { STATUS_VARIANT_BADGE_CLASS } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, ColorVariant>;
  /** Human-readable label; defaults to `status`. */
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, colorMap, label, className }) => {
  const color = colorMap[status] ?? "gray";

  return (
    <Badge variant="secondary" className={cn("text-[10px] font-medium border-0", STATUS_VARIANT_BADGE_CLASS[color], className)}>
      {label ?? status}
    </Badge>
  );
};
