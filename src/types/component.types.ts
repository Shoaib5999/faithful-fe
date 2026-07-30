export interface UploadedImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AttributeDefinition {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean" | "date";
  options?: string[];
  isRequired: boolean;
}

export interface AttributeWithValue extends AttributeDefinition {
  value: string | number | boolean | string[] | Date | null;
}

export interface AttributeValuePair {
  attributeId: string;
  value: string | number | boolean | string[] | Date | null;
}

export interface MultiStepConfig {
  title: string;
  description?: string;
  content: React.ReactNode;
}

export interface AvatarUser {
  name: string;
  avatarUrl?: string;
}

export type SkeletonVariant = "table" | "card" | "statcard" | "form" | "list";

export type EmptyIllustrationType = "orders" | "products" | "customers" | "inventory" | "search" | "generic";

export type AlertType = "success" | "error" | "warning" | "info";
