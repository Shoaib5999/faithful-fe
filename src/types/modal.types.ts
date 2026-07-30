export type ModalKey =
  | "ProductCreateEdit"
  | "OrderDetail"
  | "CustomerCreateEdit"
  | "CustomerProfile"
  | "StaffCreateEdit"
  | "StaffPermissions"
  | "CategoryCreateEdit"
  | "BrandCreateEdit"
  | "CorporateBrandDetail"
  | "UnitCreateEdit"
  | "AttributeCreateEdit"
  | "OrderStatusCreateEdit"
  | "TaxClassCreateEdit"
  | "CurrencyCreateEdit"
  | "PaymentModeCreateEdit"
  | "ShippingMethodCreateEdit"
  | "CouponCreateEdit"
  | "BannerCreateEdit"
  | "SliderCreateEdit"
  | "CutTypeCreateEdit"
  | "HomeImageEdit"
  | "ReviewAction"
  | "EmailTemplateEdit"
  | "InventoryAdjust"
  | "InventoryHistory"
  | "AddressCreateEdit"
  | "ConfirmAction"
  | "LeadDetail";

export interface ModalState {
  activeKey: ModalKey | null;
  payload: Record<string, unknown>;
}

export type ModalAction =
  | { type: "OPEN"; key: ModalKey; payload?: Record<string, unknown> }
  | { type: "CLOSE" };