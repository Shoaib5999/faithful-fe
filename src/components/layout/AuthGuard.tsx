import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes.constants";
import { isAdminPanelRole } from "@/lib/admin-auth";

export const AuthGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || !isAdminPanelRole(user?.role)) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};
