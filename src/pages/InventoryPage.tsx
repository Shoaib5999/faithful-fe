import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";
import { useModal } from "@/hooks/useModal";
import type { InventoryRecord } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";
import { SlidersHorizontal, History } from "lucide-react";

const STOCK_STATUS_COLOR: Record<string, ColorVariant> = { "In Stock": "green", "Low Stock": "yellow", "Out of Stock": "red" };
const STOCK_STATUS_LABELS: Record<string, string> = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock" };

const InventoryPage: React.FC = () => {
  const { filteredRecords, isLoading, search, setSearch, stockFilter, setStockFilter, getStockStatus } = useInventory();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<InventoryRecord>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => <span className="font-medium">{r.productName ?? "—"}</span>,
    },
    {
      key: "variant",
      header: "Variant",
      render: (r) => <span className="text-muted-foreground text-sm">{r.variantLabel ?? "—"}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      render: (r) => <span className="font-bold tabular-nums">{r.quantity}</span>,
      sortable: true,
      sortValue: (r) => r.quantity,
    },
    {
      key: "threshold",
      header: "Low-stock at",
      render: (r) => <span className="tabular-nums text-muted-foreground">{r.threshold}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const status = STOCK_STATUS_LABELS[getStockStatus(r)] ?? "Unknown";
        return <StatusBadge status={status} colorMap={STOCK_STATUS_COLOR} />;
      },
    },
    {
      key: "actions",
      header: "",
      hideable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <PermissionGate moduleKey="inventory" operation="edit">
            <Button variant="ghost" size="icon" onClick={() => openModal("InventoryAdjust", { inventory: r })}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate moduleKey="inventory" operation="edit">
            <Button variant="ghost" size="icon" onClick={() => openModal("InventoryHistory", { inventory: r })}>
              <History className="h-4 w-4" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Inventory"
        subtitle={
          isLoading
            ? "Loading…"
            : `${filteredRecords.length} active variant${filteredRecords.length !== 1 ? "s" : ""}`
        }
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredRecords}
          keyExtractor={(r) => r.id}
          emptyMessage={isLoading ? "Loading inventory…" : "No inventory rows — add products with variants in Catalog"}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by product, SKU, or variant…"
          filters={[
            {
              key: "stock",
              label: "Stock",
              value: stockFilter,
              options: [
                { label: "In Stock", value: "in_stock" },
                { label: "Low Stock", value: "low_stock" },
                { label: "Out of Stock", value: "out_of_stock" },
              ],
              onChange: (v) => setStockFilter(v as "all" | "in_stock" | "low_stock" | "out_of_stock"),
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default InventoryPage;
