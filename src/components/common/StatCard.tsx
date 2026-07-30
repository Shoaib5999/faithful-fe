import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendDirection } from "@/types/common.types";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: TrendDirection;
  trendValue: string;
  trendLabel?: string;
  variant?: "default" | "brand";
  onClick?: () => void;
}

const trendConfig: Record<TrendDirection, { icon: LucideIcon; className: string }> = {
  up: { icon: TrendingUp, className: "text-success" },
  down: { icon: TrendingDown, className: "text-destructive" },
  neutral: { icon: Minus, className: "text-muted-foreground" },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  variant = "default",
  onClick,
}) => {
  const TrendIcon = trendConfig[trend].icon;
  const isBrand = variant === "brand";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-2xl transition-all duration-200",
        isBrand ? "bg-primary text-primary-foreground" : "bg-card",
        onClick && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <span className={cn(
            "text-sm font-medium",
            isBrand ? "opacity-90" : "text-muted-foreground"
          )}>
            {label}
          </span>
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            isBrand ? "bg-primary-foreground/20" : "border border-border"
          )}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <span className="text-2xl sm:text-3xl font-bold">{value}</span>
        <div className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          isBrand
            ? "bg-brand-dark/30 text-brand-light w-fit px-2 py-1 rounded-md"
            : "text-muted-foreground border border-border w-fit px-2 py-1 rounded-md"
        )}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendValue}</span>
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
