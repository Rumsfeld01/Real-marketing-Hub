import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{
    name: string;
    initials: string;
    color?: string;
  }>;
  max?: number;
}

export function AvatarGroup({
  avatars,
  max = 3,
  className,
  ...props
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          className="border-2 border-white h-6 w-6"
        >
          <AvatarFallback
            className={cn(
              "flex h-full w-full items-center justify-center text-xs text-white",
              getBgColor(avatar.color || index)
            )}
            title={avatar.name}
          >
            {avatar.initials}
          </AvatarFallback>
        </Avatar>
      ))}

      {remainingCount > 0 && (
        <Avatar className="border-2 border-white h-6 w-6">
          <AvatarFallback
            className="flex h-full w-full items-center justify-center text-xs bg-gray-400 text-white"
            title={`${remainingCount} more`}
          >
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function getBgColor(colorOrIndex: string | number): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  if (typeof colorOrIndex === "string") {
    return `bg-${colorOrIndex}`;
  }

  return colors[colorOrIndex % colors.length];
}
