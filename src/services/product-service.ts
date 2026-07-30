import type { Product, ProductImage } from "@/types/commerce.types";
import type { ApiProduct, ProductListResponse } from "@/types/product.types";
import { api } from "@/services/api";
import {
  buildCreatePayload,
  buildUpdatePayload,
  mapApiProductImage,
  mapApiProductToCommerce,
  type ProductCreateInput,
  type ProductUpdateInput,
} from "@/lib/product-api";

export const PRODUCTS_LIST_QK = ["products", "list"] as const;
export const ADMIN_PRODUCTS_LIST_QK = ["products", "admin", "list"] as const;

export type AdminProductsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "draft" | "archived" | "all";
  categoryId?: string;
  brandId?: string;
};

export type AdminProductsListResult = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const mapListResponse = (
  data: ProductListResponse["data"],
): AdminProductsListResult => ({
  products: (data.products ?? []).map((p) =>
    mapApiProductToCommerce(p as ApiProduct),
  ),
  total: data.total ?? 0,
  page: data.page ?? 1,
  limit: data.limit ?? 12,
  totalPages: data.totalPages ?? 1,
});

export const fetchAdminProducts = async (
  params: AdminProductsListParams = {},
): Promise<AdminProductsListResult> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const search = params.search?.trim();

  const data = await api.get<ProductListResponse["data"]>("/products", {
    admin: "true",
    page,
    limit,
    ...(search ? { search } : {}),
    ...(params.status && params.status !== "all"
      ? { status: params.status }
      : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.brandId ? { brandId: params.brandId } : {}),
  });

  return mapListResponse(data);
};

export const fetchProducts = async (): Promise<Product[]> => {
  const { products } = await fetchAdminProducts({ page: 1, limit: 200 });
  return products;
};

export const getProductById = async (id: string): Promise<Product> => {
  const data = await api.get<ApiProduct>(`/products/${id}`);
  return mapApiProductToCommerce(data);
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const data = await api.get<ApiProduct>(`/products/slug/${slug}`);
  return mapApiProductToCommerce(data);
};

export const createProduct = async (input: ProductCreateInput): Promise<Product> => {
  const payload = buildCreatePayload(input);
  const data = await api.post<ApiProduct>("/products", payload);
  return mapApiProductToCommerce(data);
};

export const updateProduct = async (
  id: string,
  input: ProductUpdateInput,
): Promise<Product> => {
  const payload = buildUpdatePayload(input);
  const data = await api.put<ApiProduct>(`/products/${id}`, payload);
  return mapApiProductToCommerce(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

/** Upload files to POST /products/:id/images (multipart field: images). */
export const uploadProductImages = async (
  productId: string,
  files: File[],
): Promise<ProductImage[]> => {
  if (!files.length) return [];

  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file, file.name);
  }

  const data = await api.post<unknown[]>(`/products/${productId}/images`, formData);
  const rows = Array.isArray(data) ? data : [data];

  return rows.map((row) =>
    mapApiProductImage({
      ...(row as Record<string, unknown>),
      productId,
    }),
  );
};

export const deleteProductImage = async (
  productId: string,
  imageId: string,
): Promise<void> => {
  await api.delete(`/products/${productId}/images/${imageId}`);
};

export const addProductVariant = async (
  productId: string,
  variant: ProductCreateInput["variants"][0],
): Promise<void> => {
  await api.post(`/products/${productId}/variants`, {
    weightGrams: variant.weightGrams,
    price: variant.price,
    compareAtPrice:
      variant.compareAtPrice && variant.compareAtPrice > variant.price
        ? variant.compareAtPrice
        : null,
    stockQty: variant.stockQty,
    sku: variant.sku.trim().toUpperCase(),
  });
};

export const updateProductVariant = async (
  productId: string,
  variantId: string,
  variant: Partial<ProductCreateInput["variants"][0]>,
): Promise<void> => {
  await api.put(`/products/${productId}/variants/${variantId}`, variant);
};

export const deleteProductVariant = async (
  productId: string,
  variantId: string,
): Promise<void> => {
  await api.delete(`/products/${productId}/variants/${variantId}`);
};

export const getAllProducts = async (): Promise<Product[]> => fetchProducts();

export const getProductArray = async (): Promise<Product[]> => fetchProducts();
