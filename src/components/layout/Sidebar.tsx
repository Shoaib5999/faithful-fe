import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  NAV_GROUPS,
  NAV_GROUP_LABELS,
  openNavItem,
  type NavGroup,
} from "@/constants/nav.constants";
import { APP_CONFIG } from "@/constants/app.constants";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const groups = (["menu", "management", "general"] as NavGroup[]).map((group) => ({
    key: group,
    label: NAV_GROUP_LABELS[group],
    items: NAV_GROUPS.filter((item) => item.group === group),
  }));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-surface transition-all",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-7 z-40 flex h-6 w-6 translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}

      <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-2")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-primary">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-foreground">{APP_CONFIG.name}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group) => (
          <div key={group.key}>
            {!collapsed && (
              <span className="mb-3 block px-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
                {group.label}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = getIcon(item.icon);
                const isExternal =
                  item.route.startsWith("http://") || item.route.startsWith("https://");
                const isActive = !isExternal && location.pathname === item.route;

                const buttonContent = (
                  <Button
                    variant="ghost"
                    {...(isExternal ? {} : { asChild: true })}
                    onClick={isExternal ? () => openNavItem(item) : undefined}
                    className={cn(
                      "relative w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-normal transition-colors",
                      isActive
                        ? "bg-primary/8 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {isExternal ? (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </>
                    ) : (
                      <Link to={item.route}>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    )}
                  </Button>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.key} delayDuration={0}>
                      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return <React.Fragment key={item.key}>{buttonContent}</React.Fragment>;
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
