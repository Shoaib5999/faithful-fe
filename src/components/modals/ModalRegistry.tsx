import React, { lazy, Suspense } from "react";
import { useModal } from "@/hooks/useModal";
import type { ModalKey } from "@/types/modal.types";

const ConfirmModal = lazy(() =>
  import("@/components/modals/ConfirmModal").then((m) => ({ default: m.ConfirmModal })),
);
const UnitCreateEditModal = lazy(() =>
  import("@/components/modals/UnitCreateEditModal").then((m) => ({
    default: m.UnitCreateEditModal,
  })),
);
const BrandCreateEditModal = lazy(() =>
  import("@/components/modals/BrandCreateEditModal").then((m) => ({
    default: m.BrandCreateEditModal,
  })),
);
const CategoryCreateEditModal = lazy(() =>
  import("@/components/modals/CategoryCreateEditModal").then((m) => ({
    default: m.CategoryCreateEditModal,
  })),
);
const AttributeCreateEditModal = lazy(() =>
  import("@/components/modals/AttributeCreateEditModal").then((m) => ({
    default: m.AttributeCreateEditModal,
  })),
);
const OrderStatusCreateEditModal = lazy(() =>
  import("@/components/modals/OrderStatusCreateEditModal").then((m) => ({
    default: m.OrderStatusCreateEditModal,
  })),
);
const TaxClassCreateEditModal = lazy(() =>
  import("@/components/modals/TaxClassCreateEditModal").then((m) => ({
    default: m.TaxClassCreateEditModal,
  })),
);
const CurrencyCreateEditModal = lazy(() =>
  import("@/components/modals/CurrencyCreateEditModal").then((m) => ({
    default: m.CurrencyCreateEditModal,
  })),
);
const PaymentModeCreateEditModal = lazy(() =>
  import("@/components/modals/PaymentModeCreateEditModal").then((m) => ({
    default: m.PaymentModeCreateEditModal,
  })),
);
const ShippingMethodCreateEditModal = lazy(() =>
  import("@/components/modals/ShippingMethodCreateEditModal").then((m) => ({
    default: m.ShippingMethodCreateEditModal,
  })),
);
const ProductCreateEditModal = lazy(() =>
  import("@/components/modals/ProductCreateEditModal").then((m) => ({
    default: m.ProductCreateEditModal,
  })),
);
const OrderDetailModal = lazy(() =>
  import("@/components/modals/OrderDetailModal").then((m) => ({ default: m.OrderDetailModal })),
);
const CustomerCreateEditModal = lazy(() =>
  import("@/components/modals/CustomerCreateEditModal").then((m) => ({
    default: m.CustomerCreateEditModal,
  })),
);
const CustomerProfileModal = lazy(() =>
  import("@/components/modals/CustomerProfileModal").then((m) => ({
    default: m.CustomerProfileModal,
  })),
);
const InventoryAdjustModal = lazy(() =>
  import("@/components/modals/InventoryAdjustModal").then((m) => ({
    default: m.InventoryAdjustModal,
  })),
);
const InventoryHistoryModal = lazy(() =>
  import("@/components/modals/InventoryHistoryModal").then((m) => ({
    default: m.InventoryHistoryModal,
  })),
);
const AddressCreateEditModal = lazy(() =>
  import("@/components/modals/AddressCreateEditModal").then((m) => ({
    default: m.AddressCreateEditModal,
  })),
);
const StaffCreateEditModal = lazy(() =>
  import("@/components/modals/StaffCreateEditModal").then((m) => ({
    default: m.StaffCreateEditModal,
  })),
);
const StaffPermissionsModal = lazy(() =>
  import("@/components/modals/StaffPermissionsModal").then((m) => ({
    default: m.StaffPermissionsModal,
  })),
);
const SliderCreateEditModal = lazy(() =>
  import("@/components/modals/SliderCreateEditModal").then((m) => ({
    default: m.SliderCreateEditModal,
  })),
);
const CutTypeCreateEditModal = lazy(() =>
  import("@/components/modals/CutTypeCreateEditModal").then((m) => ({
    default: m.CutTypeCreateEditModal,
  })),
);
const HomeImageEditModal = lazy(() =>
  import("@/components/modals/HomeImageEditModal").then((m) => ({
    default: m.HomeImageEditModal,
  })),
);
const BannerCreateEditModal = lazy(() =>
  import("@/components/modals/BannerCreateEditModal").then((m) => ({
    default: m.BannerCreateEditModal,
  })),
);
const ReviewActionModal = lazy(() =>
  import("@/components/modals/ReviewActionModal").then((m) => ({ default: m.ReviewActionModal })),
);
const CouponCreateEditModal = lazy(() =>
  import("@/components/modals/CouponCreateEditModal").then((m) => ({
    default: m.CouponCreateEditModal,
  })),
);
const LeadDetailModal = lazy(() =>
  import("@/components/modals/LeadDetailModal").then((m) => ({ default: m.LeadDetailModal })),
);
const modalComponents: Partial<Record<ModalKey, React.LazyExoticComponent<React.FC>>> = {
  ConfirmAction: ConfirmModal,
  UnitCreateEdit: UnitCreateEditModal,
  BrandCreateEdit: BrandCreateEditModal,
  CategoryCreateEdit: CategoryCreateEditModal,
  AttributeCreateEdit: AttributeCreateEditModal,
  OrderStatusCreateEdit: OrderStatusCreateEditModal,
  TaxClassCreateEdit: TaxClassCreateEditModal,
  CurrencyCreateEdit: CurrencyCreateEditModal,
  PaymentModeCreateEdit: PaymentModeCreateEditModal,
  ShippingMethodCreateEdit: ShippingMethodCreateEditModal,
  ProductCreateEdit: ProductCreateEditModal,
  OrderDetail: OrderDetailModal,
  CustomerCreateEdit: CustomerCreateEditModal,
  CustomerProfile: CustomerProfileModal,
  InventoryAdjust: InventoryAdjustModal,
  InventoryHistory: InventoryHistoryModal,
  AddressCreateEdit: AddressCreateEditModal,
  StaffCreateEdit: StaffCreateEditModal,
  StaffPermissions: StaffPermissionsModal,
  SliderCreateEdit: SliderCreateEditModal,
  CutTypeCreateEdit: CutTypeCreateEditModal,
  HomeImageEdit: HomeImageEditModal,
  BannerCreateEdit: BannerCreateEditModal,
  ReviewAction: ReviewActionModal,
  CouponCreateEdit: CouponCreateEditModal,
  LeadDetail: LeadDetailModal,
};

export const ModalRegistry: React.FC = () => {
  const { activeKey } = useModal();

  if (!activeKey) return null;

  const ModalComponent = modalComponents[activeKey];
  if (!ModalComponent) return null;

  return (
    <Suspense fallback={null}>
      <ModalComponent />
    </Suspense>
  );
};
