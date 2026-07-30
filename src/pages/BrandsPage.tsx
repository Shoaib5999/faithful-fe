import React, { useState, useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useBrand } from "@/hooks/useBrand";
import { useModal } from "@/hooks/useModal";
import type { Brand } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";

const STATUS_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

const BrandsPage: React.FC = () => {
  const { brands, confirmDelete } = useBrand();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? b.isActive : !b.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const columns: DataTableOneColumn<Brand>[] = useMemo(() => [
    {
      key: "logo", header: "Logo", render: (row) => (
        <Avatar className="h-9 w-9 rounded-md">
          {row.logoUrl ? <AvatarImage src={row.logoUrl} alt={row.name} /> : null}
          <AvatarFallback className="rounded-md text-xs">{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: "name", header: "Name", render: (row) => <span className="font-medium">{row.name}</span>, sortable: true, sortValue: (r) => r.name },
    { key: "slug", header: "Slug", render: (row) => <span className=" text-xs text-muted-foreground">{row.slug}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.isActive ? "Active" : "Inactive"} colorMap={STATUS_COLOR} /> },
    {
      key: "actions", header: "",hideable: false, render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <PermissionGate moduleKey="products" operation="edit">
            <Button variant="ghost" size="icon" onClick={() => openModal("BrandCreateEdit", { brand: row })}>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate moduleKey="products" operation="delete">
            <Button variant="ghost" size="icon" onClick={() => confirmDelete(row)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ], [openModal, confirmDelete]);

  return (
    <PageWrapper>
      <PageHeader
        title="Brands"
        subtitle={`${filteredBrands.length} brand${filteredBrands.length !== 1 ? "s" : ""}`}
        actions={
          <PermissionGate moduleKey="products" operation="create">
            <Button onClick={() => openModal("BrandCreateEdit")}>
              <Plus className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          </PermissionGate>
        }
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredBrands}
          keyExtractor={(b) => b.id}
          emptyMessage="No brands found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search brands..."
          filters={[
            {
              key: "status", label: "Status", value: statusFilter,
              options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }],
              onChange: setStatusFilter,
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default BrandsPage;
