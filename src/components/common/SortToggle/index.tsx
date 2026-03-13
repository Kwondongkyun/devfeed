"use client";

import { cn } from "@/lib/utils";

interface SortOption<T extends string> {
  key: T;
  label: string;
}

interface SortToggleProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function SortToggle<T extends string>({
  options,
  value,
  onChange,
}: SortToggleProps<T>) {
  return (
    <div className="flex w-fit rounded-[16px] bg-card">
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "cursor-pointer rounded-[16px] px-3 py-2.5 font-mono text-[11px] font-semibold uppercase transition-colors sm:px-4",
            value === option.key
              ? "bg-teal text-text-dark"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
