import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Building2,
  GalleryHorizontal,
  Image,
  Star,
  Ticket,
  BarChart3,
  Mail,
  MessageSquare,
  Settings,
  Grid3X3,
  Monitor,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Building2,
  GalleryHorizontal,
  Image,
  Star,
  Ticket,
  BarChart3,
  Mail,
  MessageSquare,
  Settings,
  Grid3X3,
  Monitor,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard;
}
