import type { ColorVariant } from "@/types/common.types";

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  type: "weight" | "volume" | "count" | "length";
  isActive: boolean;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
}

export interface AttributeOption {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
}

export type AttributeType = "text" | "number" | "select" | "multiselect" | "boolean" | "date";

export type Attribute = {
  id: string;
  name: string;
  code: string;
  type: AttributeType;
  isRequired: boolean;
  isFilterable: boolean;
  isActive: boolean;
  values?: AttributeOption[];
};

export type AttributeOptionCreateInput = {
  label: string;
  value: string;
  sortOrder: number;
};

export type AttributeCreateInput = Omit<Attribute, "id" | "options"> & {
  options?: AttributeOptionCreateInput[];
};

export interface OrderStatus {
  id: string;
  label: string;
  code: string;
  color: ColorVariant;
  isDefault: boolean;
  isFinal: boolean;
  sortOrder: number;
}

export interface TaxClass {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: "before" | "after";
  decimalSeparator: string;
  thousandSeparator: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ShippingSettings {
  id: string;
  defaultShippingFee: string | number;
  freeShippingThreshold: string | number;
  isFreeShippingEnabled: boolean;
  updatedAt?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  fee: string | number;
  deliveryLabel: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type FormErrors = Record<string, string | undefined>;
