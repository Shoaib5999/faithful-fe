import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeMap: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  fullScreen = false,
}) => {
  return (
    <div className={cn(
      "flex items-center justify-center",
      fullScreen && "fixed inset-0 z-50 bg-background"
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
    </div>
  );
};
