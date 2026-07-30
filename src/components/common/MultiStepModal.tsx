import React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MultiStepConfig } from "@/types/component.types";

interface MultiStepModalProps {
  open: boolean;
  onClose: () => void;
  steps: MultiStepConfig[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  completeLabel?: string;
  isCompleting?: boolean;
}

export const MultiStepModal: React.FC<MultiStepModalProps> = ({
  open,
  onClose,
  steps,
  currentStep,
  onStepChange,
  onComplete,
  completeLabel = "Submit",
  isCompleting = false,
}) => {
  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={current?.title ?? ""}
      description={current?.description}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-8 sm:w-12",
                    idx <= currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  idx < currentStep && "bg-primary text-primary-foreground",
                  idx === currentStep && "bg-primary text-primary-foreground",
                  idx > currentStep && "border border-border bg-muted text-muted-foreground"
                )}
              >
                {idx < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-0">{current?.content}</div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={isFirst}
          >
            Back
          </Button>
          {isLast ? (
            <Button onClick={onComplete} disabled={isCompleting}>
              {isCompleting ? "Processing..." : completeLabel}
            </Button>
          ) : (
            <Button onClick={() => onStepChange(currentStep + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};
