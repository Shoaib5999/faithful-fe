import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomer } from "@/hooks/useCustomer";
import { formatCurrency, computeInitials, formatDate } from "@/lib/formatters";
import type { Customer } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

const CustomersPage: React.FC = () => {
  const {
    filteredCustomers, search, setSearch,
    statusFilter, setStatusFilter, handleToggleActive, isLoading,
  } = useCustomer();

  const columns: DataTableOneColumn<Customer>[] = [
    {
      key: "avatar", header: "",hideable: false, render: (r) => (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{computeInitials(`${r.firstName} ${r.lastName}`)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "name", header: "Name", render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.firstName} {r.lastName}</span>
          {r.email && <span className="text-xs text-muted-foreground">{r.email}</span>}
        </div>
      ), sortable: true, sortValue: (r) => `${r.firstName} ${r.lastName}`,
    },
    { key: "phone", header: "Phone", render: (r) => <span className="text-muted-foreground">{r.phone ?? "—"}</span> },
    { key: "orders", header: "Orders", render: (r) => <span>{r.totalOrders}</span>, sortable: true, sortValue: (r) => r.totalOrders },
    { key: "spent", header: "Total Spent", render: (r) => formatCurrency(r.totalSpent), sortable: true, sortValue: (r) => r.totalSpent },
    { key: "joined", header: "Joined", render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>, sortable: true, sortValue: (r) => r.createdAt },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex justify-end">
          <PermissionGate moduleKey="customers" operation="edit">
            <Switch
              checked={r.isActive}
              onCheckedChange={() => handleToggleActive(r)}
              aria-label={r.isActive ? "Deactivate customer" : "Activate customer"}
            />
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Customers"
        subtitle={`${filteredCustomers.length} storefront customers`}
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(r) => r.id}
          emptyMessage={isLoading ? "Loading customers..." : "No storefront customers found"}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email, or phone..."
          filters={[
            {
              key: "status", label: "Status", value: statusFilter,
              options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }],
              onChange: (v) => setStatusFilter(v as "all" | "active" | "inactive"),
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default CustomersPage;
