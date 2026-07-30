import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AvatarUser } from "@/types/component.types";

interface AvatarGroupProps {
  users: AvatarUser[];
  max?: number;
  size?: "small" | "medium" | "large";
}

const sizeMap: Record<string, string> = {
  small: "h-7 w-7 text-[10px]",
  medium: "h-9 w-9 text-xs",
  large: "h-11 w-11 text-sm",
};

const computeInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = "medium",
}) => {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const sizeClass = sizeMap[size];

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user, i) => (
        <Avatar
          key={i}
          className={cn(sizeClass, "border-2 border-background")}
        >
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {computeInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <Avatar className={cn(sizeClass, "border-2 border-background")}>
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            +{overflow}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
