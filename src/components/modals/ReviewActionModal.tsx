import React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useReview } from "@/hooks/useReview";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { formatDate } from "@/lib/formatters";
import type { Review } from "@/types/cms.types";
import type { ColorVariant } from "@/types/common.types";
import { Star, ShieldCheck } from "lucide-react";

const STATUS_COLOR: Record<string, ColorVariant> = { pending: "yellow", approved: "green", rejected: "red" };

export const ReviewActionModal: React.FC = () => {
  const { activeKey, payload, closeModal, openModal } = useModal();
  const { handleApprove, handleReject, handleDelete } = useReview();
  const review = payload?.review as Review | undefined;

  if (!review) return null;

  const confirmAction = (title: string, description: string, onConfirm: () => void) => {
    openModal("ConfirmAction", { title, description, onConfirm });
  };

  return (
    <ResponsiveModal open={activeKey === "ReviewAction"} onOpenChange={() => closeModal()} title="Review Details">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-semibold">{review.productName}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{review.customerName}</span>
            {review.isVerifiedPurchase && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3 text-green-600" /> Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
          ))}
        </div>

        <div>
          <span className="text-lg font-bold">{review.title}</span>
          <p className="mt-2 text-muted-foreground">{review.body}</p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={review.status} colorMap={STATUS_COLOR} />
          <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
        </div>

        <div className="flex gap-2 pt-4 justify-end">
          {(review.status === "pending" || review.status === "rejected") && (
            <PermissionGate moduleKey="cms_reviews" operation="edit">
              <Button variant="outline" className="text-green-600" onClick={() =>
                confirmAction("Approve Review", "Approve this review?", async () => { await handleApprove(review.id); closeModal(); })
              }>Approve</Button>
            </PermissionGate>
          )}
          {(review.status === "pending" || review.status === "approved") && (
            <PermissionGate moduleKey="cms_reviews" operation="edit">
              <Button variant="outline" className="text-destructive" onClick={() =>
                confirmAction("Reject Review", "Reject this review?", async () => { await handleReject(review.id); closeModal(); })
              }>Reject</Button>
            </PermissionGate>
          )}
          <PermissionGate moduleKey="cms_reviews" operation="delete">
            <Button variant="destructive" onClick={() =>
              confirmAction("Delete Review", "Delete this review permanently?", async () => { await handleDelete(review.id); closeModal(); })
            }>Delete</Button>
          </PermissionGate>
        </div>
      </div>
    </ResponsiveModal>
  );
};
