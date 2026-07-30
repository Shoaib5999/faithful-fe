import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";
import { MasterDataProvider } from "@/context/MasterDataContext";
import { ModalRegistry } from "@/components/modals/ModalRegistry";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMasterData } from "@/hooks/useMasterData";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { COUPONS_QK, REVIEWS_QK } from "@/hooks/useGlobalSearch";
import { fetchCoupons } from "@/services/coupon-service";
import { fetchReviews } from "@/services/review-service";
import { fetchOrders, ORDERS_QK } from "@/services/order-service";
import { fetchProducts, PRODUCTS_LIST_QK } from "@/services/product-service";

const AppContent: React.FC = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    void queryClient.prefetchQuery({ queryKey: COUPONS_QK, queryFn: fetchCoupons });
    void queryClient.prefetchQuery({ queryKey: REVIEWS_QK, queryFn: fetchReviews });
    void queryClient.prefetchQuery({ queryKey: ORDERS_QK, queryFn: fetchOrders });
    void queryClient.prefetchQuery({ queryKey: PRODUCTS_LIST_QK, queryFn: fetchProducts });
  }, [queryClient]);

  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(
    () => !isMobile && typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const sidebarWidth = isMobile ? "0px" : collapsed ? "64px" : "240px";
  const { isLoading } = useMasterData();

  return (
    <>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
        <TopBar sidebarWidth={sidebarWidth} />

        <main
          className="pt-16 pb-0 md:pb-0"
          style={{ marginLeft: sidebarWidth, paddingBottom: isMobile ? "64px" : "0px" }}
        >
          <ErrorBoundary>
            {isLoading ? <PageSkeleton variant="table" /> : <Outlet />}
          </ErrorBoundary>
        </main>

        <BottomBar />
      </div>
      <ModalRegistry />
    </>
  );
};

export const AppShell: React.FC = () => (
  <MasterDataProvider>
    <AppContent />
  </MasterDataProvider>
);
