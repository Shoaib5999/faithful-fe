import React, { useContext } from "react";
import { NotificationContext } from "@/context/NotificationContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: "border-green-500 bg-green-50 text-green-800",
  error: "border-red-500 bg-red-50 text-red-800",
  warning: "border-amber-500 bg-amber-50 text-amber-800",
  info: "border-blue-500 bg-blue-50 text-blue-800",
};

export const NotificationStack: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { notifications } = context;

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2" style={{ maxWidth: "360px" }}>
      {notifications.map((n) => {
        const Icon = iconMap[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md animate-fade-in",
              styleMap[n.type]
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{n.message}</span>
          </div>
        );
      })}
    </div>
  );
};
