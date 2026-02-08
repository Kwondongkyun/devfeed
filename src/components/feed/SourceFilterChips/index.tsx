"use client";

import { cn } from "@/lib/utils";

import type { SourceItem } from "@/features/feed/sources/types";

interface SourceFilterChipsProps {
  sources: SourceItem[];
  activeSourceId: string | null;
  onChange: (sourceId: string | null) => void;
}

export function SourceFilterChips({
  sources,
  activeSourceId,
  onChange,
}: SourceFilterChipsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          activeSourceId === null
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:bg-accent",
        )}
      >
        All
      </button>
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() =>
            onChange(activeSourceId === source.id ? null : source.id)
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            activeSourceId === source.id
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-accent",
          )}
        >
          {source.name}
        </button>
      ))}
    </div>
  );
}
