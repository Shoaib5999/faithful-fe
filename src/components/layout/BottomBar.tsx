import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Grid3X3 } from "lucide-react";
import { BOTTOM_BAR_KEYS, NAV_GROUPS } from "@/constants/nav.constants";
import { getIcon } from "@/lib/icon-map";
import { MorePanel } from "@/components/layout/MorePanel";
import { cn } from "@/lib/utils";

export const BottomBar: React.FC = () => {
  const location = useLocation();
  const [morePanelOpen, setMorePanelOpen] = useState(false);

  const bottomItems = BOTTOM_BAR_KEYS.map((key) =>
    NAV_GROUPS.find((item) => item.key === key)
  ).filter(Boolean);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-surface md:hidden">
        {bottomItems.map((item) => {
          if (!item) return null;
          const Icon = getIcon(item.icon);
          const isActive = location.pathname === item.route;
          const isPOS = item.key === "pos";

          if (isPOS) {
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => window.open(item.route, "_blank")}
                className={cn(
                  "flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-none px-0",
                  "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            );
          }

          return (
            <Button
              key={item.key}
              variant="ghost"
              asChild
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-none px-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link to={item.route}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            </Button>
          );
        })}

        <Button
          variant="ghost"
          onClick={() => setMorePanelOpen(true)}
          className={cn(
            "flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-none px-0",
            morePanelOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Grid3X3 className="h-5 w-5" />
          <span className="text-[10px]">More</span>
        </Button>
      </div>

      <MorePanel open={morePanelOpen} onClose={() => setMorePanelOpen(false)} />
    </>
  );
};
