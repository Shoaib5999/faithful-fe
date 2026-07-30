import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBrand } from "@/hooks/useBrand";
import { useModal } from "@/hooks/useModal";
import { computeInitials } from "@/lib/formatters";
import type { Brand } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const BrandsSection: React.FC = () => {
  const { brands, confirmDelete } = useBrand();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<Brand>[] = [
    {
      key: "logo", header: "Logo", render: (r) => (
        <Avatar className="h-8 w-8">
          {r.logoUrl && <AvatarImage src={r.logoUrl} />}
          <AvatarFallback className="text-xs">{computeInitials(r.name)}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: "name", header: "Name", render: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: "slug", header: "Slug", render: (r) => <span className=" text-muted-foreground">{r.slug}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openModal("BrandCreateEdit", { brand: r })}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Brands" actions={<Button size="sm" onClick={() => openModal("BrandCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Brand</Button>} />
      <DataTableOne columns={columns} data={brands} keyExtractor={(r) => r.id} emptyMessage="No brands yet" />
    </div>
  );
};