import { Loader2, X } from "lucide-react";
import {
  StoreGhostButton,
  StoreModalPortal,
  StorePrimaryButton,
  storePanelClass,
  useStoreBodyScrollLock,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

type StoreConfirmModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function StoreConfirmModal({
  open,
  title,
  subtitle,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirming = false,
  destructive = false,
  onClose,
  onConfirm,
}: StoreConfirmModalProps) {
  useStoreBodyScrollLock(open);

  if (!open) return null;

  const handleBackdrop = () => {
    if (!confirming) onClose();
  };

  return (
    <StoreModalPortal>
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(storePanelClass, "relative w-full max-w-md overflow-hidden rounded-xl")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-confirm-title"
      >
        <div className="flex items-start justify-between border-b border-black/10 px-6 py-5 md:px-8 md:py-6">
          <div>
            {subtitle ? (
              <p className="font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
                {subtitle}
              </p>
            ) : null}
            <h3
              id="store-confirm-title"
              className={cn(
                " text-xl font-bold uppercase tracking-wide text-[var(--store-ink)]",
                subtitle && "mt-1",
              )}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="cursor-pointer rounded-md p-2 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)] disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 md:px-8 md:py-6">
          <p className="font-store-body text-sm leading-relaxed text-[var(--store-muted)]">{description}</p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-black/10 px-6 py-5 sm:flex-row sm:justify-end md:px-8 md:py-6">
          <StoreGhostButton
            type="button"
            disabled={confirming}
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </StoreGhostButton>
          <StorePrimaryButton
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
              destructive && "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 focus-visible:outline-red-300",
            )}
          >
            {confirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Please wait…
              </>
            ) : (
              confirmLabel
            )}
          </StorePrimaryButton>
        </div>
      </div>
    </div>
    </StoreModalPortal>
  );
}
