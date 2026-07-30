// Types mirroring the backend Product API response.
import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";

export interface ProductVariant {
    id: string;
    productId: string;
    weightGrams: number;
    /** Decimal serialized as string by the API (e.g. "1299"). */
    price: string;
    compareAtPrice?: string | null;
    stockQty: number;
    sku: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: string;
    url: string;
    alt?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
}

export interface ProductTaxClass {
    id: string;
    name: string;
    rate: number;
}

export interface ApiProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    brandId: string | null;
    taxClassId: string | null;
    /** Comma-separated tag string from the API. */
    tags: string;
    storefrontMeta?: ProductStorefrontMeta | null;
    sortOrder?: number;
    isActive: boolean;
    avgRating?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt: string;
    variants: ProductVariant[];
    images: ProductImage[];
    category: ProductCategory | null;
    brand: ProductBrand | null;
    taxClass: ProductTaxClass | null;
}

export type StorefrontProductApi = ApiProduct & {
    avgRating?: number;
    reviewCount?: number;
};

export interface ProductListResponse {
    success: boolean;
    message: string;
    data: {
        products: ApiProduct[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
