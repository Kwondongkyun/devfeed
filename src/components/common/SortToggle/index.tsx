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
    <div className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.key
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
