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
    <div className="flex rounded-[16px] bg-card">
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "rounded-[16px] px-4 py-2 font-mono text-[11px] font-semibold uppercase transition-colors",
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
