export function ArticleCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="h-40 rounded-t-xl bg-gray-100 dark:bg-gray-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
