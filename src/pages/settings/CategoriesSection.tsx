import React, { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/hooks/useCategory";
import { useModal } from "@/hooks/useModal";
import { getTopLevel, getCategoryDisplayName } from "@/services/category-service";
import type { Category } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const CategoriesSection: React.FC = () => {
  const { categories, confirmDelete } = useCategory();
  const { openModal } = useModal();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const topLevel = getTopLevel(categories);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const rows: Array<{
    category: Category;
    isChild: boolean;
  }> = [];

  topLevel.forEach((cat) => {
    rows.push({
      category: cat,
      isChild: false,
    });

    if (
      expanded.has(cat.id) &&
      cat.children?.length
    ) {
      cat.children.forEach((child) => {
        rows.push({
          category: child,
          isChild: true,
        });
      });
    }
  });

  const columns: DataTableOneColumn<{ category: Category; isChild: boolean }>[] = [
    {
      key: "expand", header: "", hideable: false, render: (r) => {
        if (r.isChild) return null;
        const hasChildren = (r.category.children?.length ?? 0) > 0;
        if (!hasChildren) return <div className="w-8" />;
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => toggleExpand(r.category.id)}
          >
            {expanded.has(r.category.id)
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </Button>
        );
      },
    },
    {
      key: "name", header: "Name", render: (r) => (
        <div className={r.isChild ? "pl-6 border-l-2 border-primary/30" : ""}>
          <span>{getCategoryDisplayName(r.category)}</span>
        </div>
      ), sortable: true, sortValue: (r) => getCategoryDisplayName(r.category),
    },
    { key: "slug", header: "Slug", render: (r) => <span className=" text-muted-foreground">{r.category.slug}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.category.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openModal("CategoryCreateEdit", { category: r.category })}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(r.category)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Categories" actions={<Button size="sm" onClick={() => openModal("CategoryCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Category</Button>} />
      <DataTableOne columns={columns} data={rows} keyExtractor={(r) => r.category.id} emptyMessage="No categories yet" />
    </div>
  );
};