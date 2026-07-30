import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { usePaymentMode } from "@/hooks/usePaymentMode";
import { useModal } from "@/hooks/useModal";
import type { PaymentMode } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";
import { Pencil, Trash2 } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const PaymentModesSection: React.FC = () => {
  const { paymentModes, confirmDelete } = usePaymentMode();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<PaymentMode>[] = [
    { key: "label", header: "Label", render: (r) => r.label, sortable: true, sortValue: (r) => r.label },
    { key: "code", header: "Code", render: (r) => <span className=" text-muted-foreground">{r.code}</span> },
    { key: "online", header: "Online", render: (r) => <StatusBadge status={r.isOnline ? "Yes" : "No"} colorMap={{ Yes: "green", No: "gray" }} /> },
    { key: "sortOrder", header: "Sort", render: (r) => r.sortOrder, sortable: true, sortValue: (r) => r.sortOrder },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} /> },
    {
      key: "actions", header: "", hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openModal("PaymentModeCreateEdit", { paymentMode: r })}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Payment Modes" 
        // actions={<Button size="sm" onClick={() => openModal("PaymentModeCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Payment Mode</Button>} 
      />
      <DataTableOne columns={columns} data={paymentModes} keyExtractor={(r) => r.id} emptyMessage="No payment modes yet" />
    </div>
  );
};