import { NAV_GROUPS, type NavItem } from "@/constants/nav.constants";

export type GlobalSearchNavHit = {
  id: string;
  label: string;
  path: string;
  section: string;
};

const isExternalRoute = (route: string) =>
  route.startsWith("http://") || route.startsWith("https://");

/** True when the query looks like the user is searching for a screen (e.g. "cou" → Coupons). */
export function matchesNavLabel(query: string, label: string, key: string): boolean {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return false;

  const labelLower = label.toLowerCase();
  const keyLower = key.replace(/_/g, " ").toLowerCase();

  return (
    labelLower.includes(q) ||
    labelLower.startsWith(q) ||
    keyLower.includes(q) ||
    keyLower.startsWith(q)
  );
}

export function matchesCouponsTopic(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return false;
  return (
    "coupon".startsWith(q) ||
    "coupons".startsWith(q) ||
    q.startsWith("cou") ||
    q === "cou"
  );
}

export function getNavigationSearchHits(query: string): GlobalSearchNavHit[] {
  const q = query.trim();
  if (!q) return [];

  return NAV_GROUPS.filter(
    (item): item is NavItem & { route: string } =>
      !isExternalRoute(item.route) && matchesNavLabel(q, item.label, item.key),
  ).map((item) => ({
    id: `nav-${item.key}`,
    label: item.label,
    path: item.route,
    section: item.group === "menu" ? "Menu" : item.group === "management" ? "Management" : "General",
  }));
}
