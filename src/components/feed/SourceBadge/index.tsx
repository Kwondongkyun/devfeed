import { cn } from "@/lib/utils";

import type { SourceType } from "@/features/feed/sources/types";

const TYPE_STYLES: Record<SourceType, string> = {
  rss: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  hackernews:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  devto:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface SourceBadgeProps {
  name: string;
  type: SourceType;
}

export function SourceBadge({ name, type }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        TYPE_STYLES[type] ||
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {name}
    </span>
  );
}
