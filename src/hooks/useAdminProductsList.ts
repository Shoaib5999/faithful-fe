import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_PRODUCTS_LIST_QK,
  fetchAdminProducts,
  type AdminProductsListParams,
} from "@/services/product-service";

type UseAdminProductsListParams = {
  page: number;
  limit: number;
  search: string;
} & Pick<AdminProductsListParams, "status" | "categoryId" | "brandId">;

export const useAdminProductsList = ({
  page,
  limit,
  search,
  status,
  categoryId,
  brandId,
}: UseAdminProductsListParams) => {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: [
      ...ADMIN_PRODUCTS_LIST_QK,
      page,
      limit,
      trimmedSearch,
      status ?? "all",
      categoryId ?? "",
      brandId ?? "",
    ],
    queryFn: () =>
      fetchAdminProducts({
        page,
        limit,
        search: trimmedSearch || undefined,
        status,
        categoryId,
        brandId,
      }),
  });
};
