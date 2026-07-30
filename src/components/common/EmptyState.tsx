import React from "react";
import { FileX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon: Icon = FileX,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</span>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
