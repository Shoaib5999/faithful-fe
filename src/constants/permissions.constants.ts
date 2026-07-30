export const MODULE_KEYS_ARRAY = [
  "dashboard",
  "products",
  "orders",
  "customers",
  "leads",
  "inventory",
  "brands",
  "cms",
  "cms_reviews",
  "coupons",
  "analytics",
  "email",
  "settings",
  "pos",
  "staff",
] as const;

export type ModuleKey = (typeof MODULE_KEYS_ARRAY)[number];

export const OPERATIONS = ["create", "read", "edit", "delete", "manage"] as const;

export type Operation = (typeof OPERATIONS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  leads: "Leads",
  inventory: "Inventory",
  brands: "Brands",
  cms: "CMS",
  cms_reviews: "CMS Reviews",
  coupons: "Coupons",
  analytics: "Analytics",
  email: "Email",
  settings: "Settings",
  pos: "POS",
  staff: "Staff",
};
