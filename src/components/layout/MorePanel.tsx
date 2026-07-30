import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BOTTOM_BAR_KEYS, NAV_GROUPS, openNavItem } from "@/constants/nav.constants";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface MorePanelProps {
  open: boolean;
  onClose: () => void;
}

export const MorePanel: React.FC<MorePanelProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const moreItems = NAV_GROUPS.filter((item) => !BOTTOM_BAR_KEYS.includes(item.key));

  const handleNavigate = (item: (typeof NAV_GROUPS)[number]) => {
    const isExternal =
      item.route.startsWith("http://") || item.route.startsWith("https://");
    if (isExternal) {
      openNavItem(item);
    } else {
      navigate(item.route);
    }
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 animate-fade-in md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface transition-transform duration-300 md:hidden",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "70vh", transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="px-4 pb-2">
          <span className="text-base font-bold text-foreground">More</span>
        </div>

        <div className="grid grid-cols-3 gap-3 overflow-y-auto px-4 pb-6" style={{ maxHeight: "calc(70vh - 60px)" }}>
          {moreItems.map((item) => {
            const Icon = getIcon(item.icon);
            const isExternal =
              item.route.startsWith("http://") || item.route.startsWith("https://");
            const isActive = !isExternal && location.pathname === item.route;

            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleNavigate(item)}
                className={cn(
                  "flex h-auto flex-col items-center gap-2 rounded-xl p-4",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};
