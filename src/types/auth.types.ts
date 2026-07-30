import type { ModuleKey, Operation } from "@/constants/permissions.constants";

export interface StaffPermission {
  moduleKey: ModuleKey;
  operations: Operation[];
}

/** Matches backend `User.role` plus legacy UI labels where used */
export type AuthUserRole =
  | "CUSTOMER"
  | "STAFF"
  | "MANAGER"
  | "ADMIN"
  | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthUserRole;
  /** Present for staff permission matrix; omitted on plain login payload */
  permissions?: StaffPermission[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
