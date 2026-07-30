import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAttribute } from "@/hooks/useAttribute";
import { useModal } from "@/hooks/useModal";
import type { Attribute } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2, Check, Minus } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = {
  Active: "green",
  Inactive: "gray",
};

const ATTR_TYPE_COLOR: Record<string, ColorVariant> = {
  text: "gray",
  number: "blue",
  select: "green",
  multiselect: "purple",
  boolean: "orange",
  date: "yellow",
};

export const AttributesSection: React.FC = () => {
  const { attributes, confirmDelete } = useAttribute();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<Attribute>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => r.name,
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <span className=" text-muted-foreground">{r.code}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <StatusBadge status={r.type} colorMap={ATTR_TYPE_COLOR} />
      ),
    },

    {
      key: "options",
      header: "Options",
      render: (r) => {
        const isSelectable =
          r.type === "select" || r.type === "multiselect";

        if (!isSelectable) return <span className="text-muted-foreground">—</span>;

        return (
          <Badge variant="secondary">
            {r?.values?.length ?? 0}
          </Badge>
        );
      },
    },

    {
      key: "required",
      header: "Required",
      render: (r) =>
        r.isRequired ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },

    {
      key: "filterable",
      header: "Filterable",
      render: (r) =>
        r.isFilterable ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },

    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          status={r.isActive ? "Active" : "Inactive"}
          colorMap={ACTIVE_COLOR}
        />
      ),
    },

    {
      key: "actions",
      header: "",
      hideable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              openModal("AttributeCreateEdit", { attribute: r })
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => confirmDelete(r)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Attributes"
        actions={
          <Button
            size="sm"
            onClick={() => openModal("AttributeCreateEdit", {})}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Attribute
          </Button>
        }
      />

      <DataTableOne
        columns={columns}
        data={attributes || []}
        keyExtractor={(r) => r.id}
        emptyMessage="No attributes yet"
      />
    </div>
  );
};