import React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils";

export const ConfirmModal: React.FC = () => {
  const { payload, closeModal } = useModal();

  const title = (payload.title as string) ?? "Confirm";
  const description = (payload.description as string) ?? "Are you sure?";
  const confirmLabel = (payload.confirmLabel as string) ?? "Confirm";
  const cancelLabel = (payload.cancelLabel as string) ?? "Cancel";
  const onConfirm = payload.onConfirm as (() => void) | undefined;
  const variant = (payload.variant as "destructive" | "default") ?? "default";

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={title}>
      <div className="flex flex-col gap-4">
        <span className="text-sm text-muted-foreground">{description}</span>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
