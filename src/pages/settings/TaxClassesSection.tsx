import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaxClass } from "@/hooks/useTaxClass";
import { useModal } from "@/hooks/useModal";
import type { TaxClass } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const TaxClassesSection: React.FC = () => {
  const { taxClasses, confirmDelete } = useTaxClass();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<TaxClass>[] = [
    { key: "name", header: "Name", render: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: "rate", header: "Rate", render: (r) => `${r.rate}%` },
    { key: "default", header: "Default", render: (r) => r.isDefault ? <Badge variant="secondary">Default</Badge> : null },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openModal("TaxClassCreateEdit", { taxClass: r })}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tax Classes" actions={<Button size="sm" onClick={() => openModal("TaxClassCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Tax Class</Button>} />
      <DataTableOne columns={columns} data={taxClasses} keyExtractor={(r) => r.id} emptyMessage="No tax classes yet" />
    </div>
  );
};