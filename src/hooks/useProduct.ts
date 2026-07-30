import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductStatus } from "@/types/commerce.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import {
  fetchProducts,
  createProduct,
  uploadProductImages,
  updateProduct,
  deleteProduct,
  PRODUCTS_LIST_QK,
} from "@/services/product-service";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/product-api";
import { getErrorMessage } from "@/lib/error";

export const useProduct = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [isMutating, setIsMutating] = useState(false);
  const { notify } = useNotification();
  const { openModal } = useModal();

  const {
    data: products = [],
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: PRODUCTS_LIST_QK,
    queryFn: fetchProducts,
  });

  const reloadProducts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    const result = await refetch();
    return result.data ?? [];
  }, [queryClient, refetch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
    });
  }, [products, search, brandFilter, categoryFilter, statusFilter]);

  const getProductStock = useCallback(
    (productId: string): number => {
      const product = products.find((p) => p.id === productId);
      if (!product) return 0;
      return product.variants.reduce((sum, v) => sum + v.stockQty, 0);
    },
    [products],
  );

  const handleCreate = useCallback(
    async (input: ProductCreateInput, imageFiles: File[] = []) => {
      setIsMutating(true);
      try {
        const created = await createProduct(input);

        if (imageFiles.length > 0) {
          await uploadProductImages(created.id, imageFiles);
        }

        await reloadProducts();
        notify(
          imageFiles.length > 0
            ? `Product created with ${imageFiles.length} image(s)`
            : "Product created successfully",
          "success",
        );
        return created;
      } catch (err) {
        notify(getErrorMessage(err), "error");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [notify, reloadProducts],
  );

  const handleUpdate = useCallback(
    async (id: string, input: ProductUpdateInput) => {
      setIsMutating(true);
      try {
        await updateProduct(id, input);
        await reloadProducts();
        notify("Product updated successfully", "success");
      } catch (err) {
        notify(getErrorMessage(err), "error");
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [notify, reloadProducts],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id);
        await reloadProducts();
        notify("Product archived successfully", "success");
      } catch (err) {
        notify(getErrorMessage(err), "error");
      }
    },
    [notify, reloadProducts],
  );

  const confirmDelete = useCallback(
    (product: Product) => {
      openModal("ConfirmAction", {
        title: "Archive Product",
        description: `Archive "${product.name}"? It will be hidden from the shop.`,
        variant: "destructive",
        confirmLabel: "Archive",
        onConfirm: () => handleDelete(product.id),
      });
    },
    [openModal, handleDelete],
  );

  return {
    products,
    filteredProducts,
    isLoading,
    isMutating,
    search,
    setSearch,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    handleCreate,
    handleUpdate,
    handleDelete,
    confirmDelete,
    getProductStock,
    reloadProducts,
  };
};
