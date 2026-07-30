import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBrand } from "@/hooks/useBrand";
import { useCategory } from "@/hooks/useCategory";
import { useProduct } from "@/hooks/useProduct";
import { useAdminProductsList } from "@/hooks/useAdminProductsList";
import { getProductById } from "@/services/product-service";
import { getCategoryDisplayName } from "@/services/category-service";
import { useNotification } from "@/hooks/useNotification";
import { getErrorMessage } from "@/lib/error";
import { useModal } from "@/hooks/useModal";
import { formatCurrency } from "@/lib/formatters";
import type { Product, ProductStatus, ProductVariant } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

const STATUS_COLOR: Record<string, ColorVariant> = {
  active: "green",
  draft: "yellow",
  archived: "gray",
};

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 20;

const getVariantPriceRange = (
  variants: ProductVariant[],
): { min: number; max: number } | null => {
  const active = variants.filter((v) => v.isActive);
  if (!active.length) return null;
  const prices = active.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

const getTotalStock = (variants: ProductVariant[]): number =>
  variants.reduce((sum, v) => sum + v.stockQty, 0);

const getDisplayPrice = (product: Product): string => {
  const priceRange = getVariantPriceRange(product.variants);
  if (priceRange) {
    return priceRange.min === priceRange.max
      ? formatCurrency(priceRange.min)
      : `${formatCurrency(priceRange.min)} – ${formatCurrency(priceRange.max)}`;
  }
  return formatCurrency(product.price);
};

const ProductsPage: React.FC = () => {
  const { confirmDelete } = useProduct();
  const { brands } = useBrand();
  const { categories } = useCategory();
  const { openModal } = useModal();
  const { notify } = useNotification();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, brandFilter, categoryFilter, pageSize]);

  const {
    data: listData,
    isPending: isListLoading,
    refetch: refetchList,
  } = useAdminProductsList({
    page,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    brandId: brandFilter === "all" ? undefined : brandFilter,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const products = listData?.products ?? [];
  const total = listData?.total ?? 0;

  const handleEdit = useCallback(
    async (product: Product) => {
      setEditingId(product.id);
      try {
        const full = await getProductById(product.id);
        openModal("ProductCreateEdit", { product: full });
      } catch (err) {
        notify(getErrorMessage(err), "error");
      } finally {
        setEditingId(null);
      }
    },
    [notify, openModal],
  );

  const columns: DataTableOneColumn<Product>[] = useMemo(
    () => [
      {
        key: "image",
        header: "Image",
        hideable: false,
        render: (row) => {
          const primaryImg =
            row.images?.find((i) => i.isPrimary) ?? row.images?.[0];
          return (
            <Avatar className="h-10 w-10 rounded-md">
              {primaryImg ? (
                <AvatarImage src={primaryImg.url} alt={row.name} />
              ) : null}
              <AvatarFallback className="rounded-md bg-muted">
                <Package className="h-4 w-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          );
        },
      },
      {
        key: "name",
        header: "Product",
        sortable: true,
        sortValue: (row) => row.name,
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.name}</span>
            {row.brand && (
              <span className="text-xs text-muted-foreground">{row.brand.name}</span>
            )}
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.category ? getCategoryDisplayName(row.category) : "—"}
          </span>
        ),
      },
      {
        key: "brand",
        header: "Brand",
        render: (row) => (
          <span className="text-sm">{row.brand?.name ?? "—"}</span>
        ),
      },
      {
        key: "sortOrder",
        header: "Order",
        sortable: true,
        sortValue: (row) => row.sortOrder ?? 0,
        render: (row) => (
          <span className="text-sm text-muted-foreground">{row.sortOrder ?? 0}</span>
        ),
      },
      {
        key: "price",
        header: "Price",
        sortable: true,
        sortValue: (row) => {
          const range = getVariantPriceRange(row.variants);
          return range?.min ?? row.price;
        },
        render: (row) => <span className="font-medium">{getDisplayPrice(row)}</span>,
      },
      {
        key: "stock",
        header: "Stock",
        sortable: true,
        sortValue: (row) =>
          row.variants.length > 0 ? getTotalStock(row.variants) : (row.stock ?? 0),
        render: (row) => {
          const stock =
            row.variants.length > 0 ? getTotalStock(row.variants) : (row.stock ?? 0);
          const color =
            stock === 0
              ? "text-destructive"
              : stock <= 10
                ? "text-warning"
                : "text-muted-foreground";
          return <span className={color}>{stock}</span>;
        },
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <StatusBadge status={row.status} colorMap={STATUS_COLOR} />
        ),
      },
      {
        key: "actions",
        header: "",
        hideable: false,
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <PermissionGate moduleKey="products" operation="edit">
              <Button
                variant="ghost"
                size="icon"
                disabled={editingId === row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleEdit(row);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </PermissionGate>
            <PermissionGate moduleKey="products" operation="delete">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(row);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </PermissionGate>
          </div>
        ),
      },
    ],
    [confirmDelete, editingId, handleEdit],
  );

  return (
    <PageWrapper>
      <PageHeader
        title="Products"
        subtitle={`${total} product${total !== 1 ? "s" : ""}`}
        actions={
          <PermissionGate moduleKey="products" operation="create">
            <Button size="sm" onClick={() => openModal("ProductCreateEdit", {})}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add product
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={products}
          keyExtractor={(p) => p.id}
          loading={isListLoading}
          emptyMessage="No products found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search products…"
          manualPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          onRetry={() => void refetchList()}
          filters={[
            {
              key: "brand",
              label: "Brand",
              value: brandFilter,
              options: [
                // { label: "All brands", value: "all" },
                ...brands.map((brand) => ({ label: brand.name, value: brand.id })),
              ],
              onChange: (v) => setBrandFilter(v),
            },
            {
              key: "category",
              label: "Category",
              value: categoryFilter,
              options: [
                // { label: "All categories", value: "all" },
                ...categories.map((category) => ({
                  label: getCategoryDisplayName(category),
                  value: category.id,
                })),
              ],
              onChange: (v) => setCategoryFilter(v),
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "Active", value: "active" },
                { label: "Draft", value: "draft" },
                { label: "Archived", value: "archived" },
              ],
              onChange: (v) => setStatusFilter(v as ProductStatus | "all"),
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default ProductsPage;
