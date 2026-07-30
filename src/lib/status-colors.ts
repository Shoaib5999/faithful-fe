import type { ColorVariant } from "@/types/common.types";

/** Badge classes aligned with admin theme tokens (success, warning, destructive, info, primary). */
export const STATUS_VARIANT_BADGE_CLASS: Record<ColorVariant, string> = {
  green: "bg-success/10 text-success",
  yellow: "bg-warning/10 text-warning-foreground",
  red: "bg-destructive/10 text-destructive",
  blue: "bg-info/10 text-info-foreground",
  gray: "bg-secondary text-muted-foreground",
  orange: "bg-warning/15 text-warning",
  purple: "bg-primary/10 text-primary",
};

/** Left-border accent for order status cards and similar list rows. */
export const STATUS_VARIANT_BORDER_CLASS: Record<ColorVariant, string> = {
  green: "border-l-success",
  yellow: "border-l-warning",
  red: "border-l-destructive",
  blue: "border-l-info",
  gray: "border-l-border",
  orange: "border-l-warning",
  purple: "border-l-primary",
};

/** Hex presets for charts and color pickers — match admin theme palette. */
export const STATUS_VARIANT_HEX: Record<ColorVariant, string> = {
  green: "#22B35E",
  yellow: "#F5A832",
  red: "#E85D3F",
  blue: "#2EB8F0",
  gray: "#6E7280",
  orange: "#F97316",
  purple: "#3B7DD8",
};
