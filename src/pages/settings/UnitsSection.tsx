import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useUnit } from "@/hooks/useUnit";
import { useModal } from "@/hooks/useModal";
import type { Unit } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const UNIT_TYPE_COLOR: Record<string, ColorVariant> = { weight: "blue", volume: "green", count: "gray", length: "orange" };
const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const UnitsSection: React.FC = () => {
  const { units, confirmDelete } = useUnit();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<Unit>[] = [
    { key: "name", header: "Name", render: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: "symbol", header: "Symbol", render: (r) => r.symbol },
    { key: "type", header: "Type", render: (r) => <StatusBadge status={r.type} colorMap={UNIT_TYPE_COLOR} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openModal("UnitCreateEdit", { unit: r })}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Units"
        actions={
          <Button size="sm" onClick={() => openModal("UnitCreateEdit", {})}>
            <Plus className="mr-1 h-4 w-4" /> Add Unit
          </Button>
        }
      />
      <DataTableOne columns={columns} data={units} keyExtractor={(r) => r.id} emptyMessage="No units yet" />
    </div>
  );
};