import { StoreLenisScope } from "@/components/storefront/motion/StoreLenisScope";
import { StoreNavbar } from "@/components/storefront/StoreNavbar";
import { StorefrontPageFallback } from "@/components/storefront/StorefrontPageFallback";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PageSkeleton } from "@/components/common/PageSkeleton";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

import { Toaster } from "@/components/ui/toaster";
import { NotificationStack } from "./components/common";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/layout/AuthGuard";

import { ErrorBoundary } from "./components/ui/error-boundary";
import { TooltipProvider } from "./components/ui/tooltip";
import { ROUTES } from "./constants/routes.constants";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ModalProvider } from "./context/ModalContext";
import { NotificationProvider } from "./context/NotificationContext";
import { StoreAuthProvider } from "./context/StoreAuthContext";
import { StoreAuthUiProvider } from "./context/StoreAuthUiContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Collection = lazy(() => import("@/pages/Collection"));
const Product = lazy(() => import("@/pages/Product"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Contact = lazy(() => import("@/pages/Contact"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Returns = lazy(() => import("@/pages/Returns"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const AccountLayout = lazy(() => import("@/pages/account/AccountLayout"));
const AccountProfile = lazy(() => import("@/pages/account/AccountProfile"));
const AccountOrders = lazy(() => import("@/pages/account/AccountOrders"));
const AccountAddresses = lazy(() => import("@/pages/account/AccountAddresses"));
const AccountSecurity = lazy(() => import("@/pages/account/AccountSecurity"));

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const CustomersPage = lazy(() => import("@/pages/CustomersPage"));
const LeadsPage = lazy(() => import("@/pages/LeadsPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const BrandsPage = lazy(() => import("@/pages/BrandsPage"));
const CmsPage = lazy(() => import("@/pages/CmsPage"));
const CmsReviewsPage = lazy(() => import("@/pages/CmsReviewsPage"));
const CouponsPage = lazy(() => import("@/pages/CouponsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const EmailPage = lazy(() => import("@/pages/EmailPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

const S = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "dashboard" | "table" | "cards" | "settings" | "editor";
}) => <Suspense fallback={<PageSkeleton variant={variant} />}>{children}</Suspense>;

const StoreS = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<StorefrontPageFallback />}>{children}</Suspense>
);

function StorefrontErrorFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <p className="font-store-body text-sm font-semibold uppercase tracking-wider text-[#1a1a1a]">
        Something went wrong
      </p>
      <p className="mt-2 font-store-body text-sm text-[#6b6b6b]">
        Please refresh the page to continue shopping.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 bg-[#1a1a1a] px-8 py-3 font-store-body text-xs font-semibold uppercase tracking-wider text-white"
      >
        Refresh
      </button>
    </div>
  );
}

function CustomerLayout() {
  return (
    <StoreAuthProvider>
      <CartProvider>
        <StoreAuthUiProvider>
          <div className="storefront min-h-screen bg-white text-[var(--store-ink)]">
            <StoreNavbar />
            <StoreLenisScope>
              <ErrorBoundary fallback={<StorefrontErrorFallback />}>
                <Routes>
                  <Route path="/auth/callback" element={<StoreS><AuthCallback /></StoreS>} />
                  <Route path="/verify-email" element={<StoreS><VerifyEmail /></StoreS>} />
                  <Route path="/forgot-password" element={<StoreS><ForgotPassword /></StoreS>} />
                  <Route path="/reset-password" element={<StoreS><ResetPassword /></StoreS>} />
                  <Route path="/" element={<StoreS><Home /></StoreS>} />
                  <Route path="/about" element={<StoreS><About /></StoreS>} />
                  <Route path="/collection" element={<StoreS><Collection /></StoreS>} />
                  <Route path="/product/:slug" element={<StoreS><Product /></StoreS>} />
                  <Route path="/checkout" element={<StoreS><Checkout /></StoreS>} />
                  <Route path="/track-order" element={<StoreS><TrackOrder /></StoreS>} />
                  <Route path="/wishlist" element={<StoreS><Wishlist /></StoreS>} />
                  <Route path="/contact" element={<StoreS><Contact /></StoreS>} />
                  <Route path="/terms" element={<StoreS><Terms /></StoreS>} />
                  <Route path="/privacy" element={<StoreS><Privacy /></StoreS>} />
                  <Route path="/returns" element={<StoreS><Returns /></StoreS>} />
                  <Route path="/account" element={<StoreS><AccountLayout /></StoreS>}>
                    <Route index element={<StoreS><AccountProfile /></StoreS>} />
                    <Route path="orders" element={<StoreS><AccountOrders /></StoreS>} />
                    <Route path="addresses" element={<StoreS><AccountAddresses /></StoreS>} />
                    <Route path="security" element={<StoreS><AccountSecurity /></StoreS>} />
                  </Route>
                  <Route path="*" element={<StoreS><NotFound /></StoreS>} />
                </Routes>
              </ErrorBoundary>
            </StoreLenisScope>
          </div>
        </StoreAuthUiProvider>
      </CartProvider>
    </StoreAuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ModalProvider>
            <NotificationProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    <Route
                      path={ROUTES.login}
                      element={
                        <Suspense fallback={null}>
                          <LoginPage />
                        </Suspense>
                      }
                    />

                    <Route element={<AuthGuard />}>
                      <Route element={<AppShell />}>
                        <Route
                          path={ROUTES.dashboard}
                          element={
                            <S variant="dashboard">
                              <DashboardPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.products}
                          element={
                            <S variant="table">
                              <ProductsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.orders}
                          element={
                            <S variant="table">
                              <OrdersPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.customers}
                          element={
                            <S variant="table">
                              <CustomersPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.leads}
                          element={
                            <S variant="table">
                              <LeadsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.inventory}
                          element={
                            <S variant="table">
                              <InventoryPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.brands}
                          element={
                            <S variant="cards">
                              <BrandsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.cms}
                          element={
                            <S variant="cards">
                              <CmsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.cmsReviews}
                          element={
                            <S variant="table">
                              <CmsReviewsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.coupons}
                          element={
                            <S variant="table">
                              <CouponsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.analytics}
                          element={
                            <S variant="dashboard">
                              <AnalyticsPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.email}
                          element={
                            <S variant="editor">
                              <EmailPage />
                            </S>
                          }
                        />
                        <Route
                          path={ROUTES.settings}
                          element={
                            <S variant="settings">
                              <SettingsPage />
                            </S>
                          }
                        />
                      </Route>
                    </Route>

                    <Route path="*" element={<CustomerLayout />} />
                  </Routes>
                  <ScrollToTop />
                </BrowserRouter>
                <NotificationStack />
                <Toaster />
              </TooltipProvider>
            </NotificationProvider>
          </ModalProvider>
        </AuthProvider>
    </QueryClientProvider>
  );
}
