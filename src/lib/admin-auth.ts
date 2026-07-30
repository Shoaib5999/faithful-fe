import type { AuthUserRole } from "@/types/auth.types";

const ADMIN_PANEL_ROLES: AuthUserRole[] = ["ADMIN", "MANAGER", "STAFF", "superadmin"];

export function isAdminPanelRole(role: AuthUserRole | undefined): boolean {
  return Boolean(role && ADMIN_PANEL_ROLES.includes(role));
}

export function hasFullAdminAccess(role: AuthUserRole | undefined): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "superadmin";
}
