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
          "rounded-[16px] px-4 py-2 font-mono text-[11px] font-semibold uppercase transition-colors",
          activeSourceId === null
            ? "bg-orange text-text-dark"
            : "border border-border bg-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        전체
      </button>
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() =>
            onChange(activeSourceId === source.id ? null : source.id)
          }
          className={cn(
            "rounded-[16px] px-4 py-2 font-mono text-[11px] font-semibold uppercase transition-colors",
            activeSourceId === source.id
              ? "bg-orange text-text-dark"
              : "border border-border bg-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {source.name}
        </button>
      ))}
    </div>
  );
}
