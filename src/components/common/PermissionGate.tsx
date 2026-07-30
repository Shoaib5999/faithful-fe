import React from "react";
import type { ModuleKey, Operation } from "@/constants/permissions.constants";
import { useAuth } from "@/hooks/useAuth";
import { hasFullAdminAccess } from "@/lib/admin-auth";

interface PermissionGateProps {
  moduleKey: ModuleKey;
  operation: Operation;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  moduleKey,
  operation,
  children,
  fallback,
}) => {
  const { user } = useAuth();

  if (!user) return <>{fallback ?? null}</>;
  if (hasFullAdminAccess(user.role)) return <>{children}</>;

  if (user.role === "STAFF") {
    const modulePermission = user.permissions?.find((p) => p.moduleKey === moduleKey);
    if (modulePermission?.operations.includes(operation)) {
      return <>{children}</>;
    }
    if (!user.permissions?.length && operation === "read") {
      return <>{children}</>;
    }
    return <>{fallback ?? null}</>;
  }

  return <>{fallback ?? null}</>;
};
