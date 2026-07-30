import type { StaffPermission } from "@/types/auth.types";

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  isActive: boolean;
  permissions: StaffPermission[];
  role: string;
  createdAt: string;
}