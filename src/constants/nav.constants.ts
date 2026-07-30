import { ROUTES } from "./routes.constants";

export type NavGroup = "menu" | "management" | "general";

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  /** In-app path or absolute URL for external apps (e.g. POS ERP). */
  route: string;
  group: NavGroup;
}

const isExternalNavRoute = (route: string) => route.startsWith("http://") || route.startsWith("https://");

export const openNavItem = (item: NavItem) => {
  if (isExternalNavRoute(item.route)) {
    window.open(item.route, "_blank", "noopener,noreferrer");
    return;
  }
  window.location.assign(item.route);
};

export const NAV_GROUPS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", route: ROUTES.dashboard, group: "menu" },
  { key: "products", label: "Products", icon: "Package", route: ROUTES.products, group: "menu" },
  { key: "orders", label: "Orders", icon: "ShoppingCart", route: ROUTES.orders, group: "menu" },
  { key: "customers", label: "Customers", icon: "Users", route: ROUTES.customers, group: "menu" },
  { key: "leads", label: "Leads", icon: "MessageSquare", route: ROUTES.leads, group: "menu" },
  { key: "inventory", label: "Inventory", icon: "Warehouse", route: ROUTES.inventory, group: "menu" },
  // { key: "brands", label: "Brands", icon: "Building2", route: ROUTES.brands, group: "menu" },
  { key: "cms", label: "CMS", icon: "GalleryHorizontal", route: ROUTES.cms, group: "management" },
  { key: "cms_reviews", label: "Reviews", icon: "Star", route: ROUTES.cmsReviews, group: "management" },
  { key: "coupons", label: "Coupons", icon: "Ticket", route: ROUTES.coupons, group: "management" },
  { key: "analytics", label: "Analytics", icon: "BarChart3", route: ROUTES.analytics, group: "management" },
  // { key: "email", label: "Email", icon: "Mail", route: ROUTES.email, group: "management" }, // hidden until backend wired
  { key: "settings", label: "Settings", icon: "Settings", route: ROUTES.settings, group: "general" },
];

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  menu: "MENU",
  management: "MANAGEMENT",
  general: "GENERAL",
};

export const BOTTOM_BAR_KEYS: string[] = ["dashboard", "orders", "products", "customers"];
