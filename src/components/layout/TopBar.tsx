import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, LogOut, AlertTriangle, Star, ShoppingCart, MessageSquare } from "lucide-react";
import { GlobalSearchPopover } from "@/components/layout/GlobalSearchPopover";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useSystemNotifications } from "@/hooks/useSystemNotifications";
import { APP_CONFIG } from "@/constants/app.constants";
import { formatRelativeTime } from "@/lib/formatters";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopBarProps {
  sidebarWidth: string;
}

const notifIcon: Record<string, { icon: React.ElementType; className: string }> = {
  out_of_stock: { icon: AlertTriangle, className: "text-destructive" },
  low_stock: { icon: AlertTriangle, className: "text-yellow-500" },
  pending_review: { icon: Star, className: "text-yellow-500" },
  new_order: { icon: ShoppingCart, className: "text-blue-500" },
  new_lead: { icon: MessageSquare, className: "text-emerald-500" },
};

export const TopBar: React.FC<TopBarProps> = ({ sidebarWidth }) => {
  const { user, logout } = useAuth();
  const { openModal } = useModal();
  const isMobile = useIsMobile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSystemNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-20 flex h-16 bg-background items-center justify-between border-b border-border px-4 shadow-sm sm:px-6 lg:px-8"
      )}
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <span className="text-lg font-bold text-foreground">{APP_CONFIG.name}</span>
        )}
        <GlobalSearchPopover className="w-48 sm:w-64 lg:w-80" />
      </div>

      <div className="flex items-center gap-3">

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full border border-border"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto p-1 px-2 text-xs text-muted-foreground" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8">
                  <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: Icon, className: iconCls } = notifIcon[n.type] ?? notifIcon.new_order;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        openModal(n.modalKey, n.modalPayload);
                        markAsRead(n.id);
                        setNotifOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary",
                        !n.isRead && "border-l-2 border-l-primary"
                      )}
                    >
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconCls)} />
                      <div className="min-w-0 flex-1">
                        <span className={cn("block truncate text-sm text-foreground", !n.isRead && "font-semibold")}>{n.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{n.description}</span>
                        <span className="mt-0.5 block text-[10px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {unreadCount > 0 && (
              <div className="border-t border-border px-4 py-2 text-center">
                <span className="text-xs text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button
  variant="ghost"
  className="group flex items-center gap-3 px-2"
>
  <Avatar className="h-9 w-9">
    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
      {initials}
    </AvatarFallback>
  </Avatar>

  <div className="hidden text-left md:block">
    <span className="block text-sm font-semibold leading-tight text-foreground group-hover:text-white">
      {user?.name}
    </span>
    <span className="block text-xs text-muted-foreground group-hover:text-white">
      {user?.email}
    </span>
  </div>
</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm font-semibold">{user?.name}</span>
              <span className="block text-xs text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
