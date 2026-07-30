import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useModal } from "@/hooks/useModal";
import { formatDate } from "@/lib/formatters";
import type { ContactLead, LeadStatus } from "@/types/lead.types";
import type { ColorVariant } from "@/types/common.types";
import { Archive, Mail, Trash2 } from "lucide-react";

const STATUS_COLOR: Record<string, ColorVariant> = {
  new: "yellow",
  read: "green",
  archived: "gray",
};

type LeadDetailPayload = {
  lead: ContactLead;
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
  onDelete: () => void;
};

export const LeadDetailModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const open = activeKey === "LeadDetail";

  if (!open) return null;

  const { lead, onStatusChange, onDelete } = payload as LeadDetailPayload;

  const handleMarkRead = async () => {
    if (lead.status === "read") return;
    await onStatusChange(lead.id, "read");
    closeModal();
  };

  const handleArchive = async () => {
    if (lead.status === "archived") return;
    await onStatusChange(lead.id, "archived");
    closeModal();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lead.name}
            <StatusBadge status={lead.status} colorMap={STATUS_COLOR} />
          </DialogTitle>
          <DialogDescription>
            {lead.subjectLabel} · {formatDate(lead.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
            <a
              href={`mailto:${lead.email}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              {lead.email}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{lead.message}</p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              closeModal();
              onDelete();
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>

          <div className="flex gap-2">
            {lead.status !== "read" && (
              <Button type="button" variant="outline" size="sm" onClick={handleMarkRead}>
                Mark read
              </Button>
            )}
            {lead.status !== "archived" && (
              <Button type="button" variant="secondary" size="sm" onClick={handleArchive}>
                <Archive className="mr-1.5 h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
