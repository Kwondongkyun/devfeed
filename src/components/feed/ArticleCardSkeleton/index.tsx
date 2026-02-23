interface ArticleCardSkeletonProps {
  layout?: "card" | "row";
}

export function ArticleCardSkeleton({ layout = "card" }: ArticleCardSkeletonProps) {
  if (layout === "row") {
    return (
      <div className="flex animate-pulse items-center gap-4 bg-card px-6 py-4">
        <div className="h-[72px] w-[120px] shrink-0 rounded-[12px] bg-placeholder" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-16 rounded bg-placeholder" />
          <div className="h-4 w-full rounded bg-placeholder" />
          <div className="h-3 w-3/4 rounded bg-placeholder" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse overflow-hidden rounded-[16px] bg-card">
      <div className="h-[140px] bg-placeholder" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 rounded bg-placeholder" />
        <div className="h-4 w-full rounded bg-placeholder" />
        <div className="h-3 w-3/4 rounded bg-placeholder" />
      </div>
    </div>
  );
}
