import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertType } from "@/types/component.types";

interface InlineAlertProps {
  type: AlertType;
  message: string;
  dismissible?: boolean;
}

const iconMap: Record<AlertType, React.FC<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantMap: Record<AlertType, string> = {
  success: "border-success bg-success/10 text-success [&>svg]:text-success",
  error: "border-destructive bg-destructive/10 text-destructive [&>svg]:text-destructive",
  warning: "border-warning bg-warning/10 text-warning-foreground [&>svg]:text-warning",
  info: "border-info bg-info/10 text-info-foreground [&>svg]:text-info",
};

export const InlineAlert: React.FC<InlineAlertProps> = ({
  type,
  message,
  dismissible = false,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const Icon = iconMap[type];

  return (
    <Alert className={cn("relative", variantMap[type])}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="pr-6">{message}</AlertDescription>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </Alert>
  );
};
