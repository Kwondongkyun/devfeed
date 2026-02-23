import { cn } from "@/lib/utils";

import type { SourceType } from "@/features/feed/sources/types";

const TYPE_STYLES: Record<SourceType, string> = {
  rss: "bg-orange text-text-dark",
  hackernews: "bg-teal text-text-dark",
  devto: "bg-badge-blue text-white",
};

interface SourceBadgeProps {
  name: string;
  type: SourceType;
}

export function SourceBadge({ name, type }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase",
        TYPE_STYLES[type] || "bg-placeholder text-muted-foreground",
      )}
    >
      {name}
    </span>
  );
}
