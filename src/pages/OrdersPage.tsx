import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MultiSelector } from "@/components/common/MultiSelector";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useOrder";
import { useMasterData } from "@/hooks/useMasterData";
import { useModal } from "@/hooks/useModal";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { filterActiveOrderStatuses, formatOrderProductsPreview, getOrderDominantLineLabel, getOrderStatusLabel, type ProductLineFilter } from "@/lib/order-display";
import type { Order } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";
import { Eye } from "lucide-react";

const OrdersPage: React.FC = () => {
  const {
    filteredOrders, search, setSearch,
    statusFilters, setStatusFilters,
    productLineFilter, setProductLineFilter,
    dateRange, setDateRange, isLoading,
  } = useOrder();
  const { orderStatuses } = useMasterData();
  const { openModal } = useModal();
  const activeOrderStatuses = filterActiveOrderStatuses(orderStatuses);

  const statusColorMap = orderStatuses.reduce<Record<string, ColorVariant>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  const paymentStatusColorMap: Record<string, ColorVariant> = {
    PENDING: "yellow",
    PAID: "green",
    FAILED: "red",
    REFUNDED: "orange",
  };

  const statusOptions = activeOrderStatuses.map((s) => ({ label: s.label, value: s.code }));
  const productLineOptions: Array<{ label: string; value: ProductLineFilter }> = [
    { label: "All categories", value: "all" },
    { label: "Chicken", value: "chicken" },
    { label: "Mutton", value: "mutton" },
    { label: "Fish", value: "fish" },
    { label: "Seafood", value: "seafood" },
    { label: "Ready to Cook", value: "ready-to-cook" },
    { label: "Eggs", value: "eggs" },
    { label: "Combo Packs", value: "combo-packs" },
  ];

  const columns: DataTableOneColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (r) => <span className=" font-bold">{r.orderNumber}</span>, sortable: true, sortValue: (r) => r.orderNumber },
    { key: "customer", header: "Customer", render: (r) => `${r.customer.firstName} ${r.customer.lastName}` },
    {
      key: "products",
      header: "Products",
      render: (r) => (
        <span className="text-sm line-clamp-2" title={r.items.map((i) => i.productName).join(", ")}>
          {formatOrderProductsPreview(r.items)}
        </span>
      ),
    },
    {
      key: "line",
      header: "Line",
      render: (r) => {
        const label = getOrderDominantLineLabel(r);
        if (!label) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="inline-flex items-center rounded-full border border-black/10 bg-muted px-2.5 py-0.5 text-[11px] font-medium">
            {label}
          </span>
        );
      },
    },
    { key: "date", header: "Date", render: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => new Date(r.createdAt).getTime() },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          status={r.status}
          label={getOrderStatusLabel(r.status, orderStatuses)}
          colorMap={statusColorMap}
        />
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.paymentMethodCode || r.paymentMethod}</span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Pay status",
      render: (r) => (
        <StatusBadge
          status={r.paymentStatus}
          colorMap={paymentStatusColorMap}
        />
      ),
    },
    { key: "items", header: "Qty", render: (r) => <span className="text-muted-foreground">{r.items.reduce((sum, i) => sum + i.quantity, 0)}</span> },
    { key: "total", header: "Total", render: (r) => formatCurrency(r.total), sortable: true, sortValue: (r) => r.total },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openModal("OrderDetail", { order: r }); }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Orders" subtitle={`${filteredOrders.length} orders`} />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredOrders}
          keyExtractor={(r) => r.id}
          loading={isLoading}
          emptyMessage="No orders found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search orders, customers, products..."
          toolbarFilters={
            <>
              <div className="w-full sm:w-56">
                <MultiSelector options={statusOptions} selected={statusFilters} onChange={setStatusFilters} placeholder="All Statuses" />
              </div>
              <div className="w-full sm:w-44">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={productLineFilter}
                  onChange={(e) => setProductLineFilter(e.target.value as ProductLineFilter)}
                >
                  {productLineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Date range" />
            </>
          }
        />
      </div>
    </PageWrapper>
  );
};

export default OrdersPage;
