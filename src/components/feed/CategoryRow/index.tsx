"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ArticleCard } from "@/components/feed/ArticleCard";
import { ArticleCardSkeleton } from "@/components/feed/ArticleCardSkeleton";

import { listArticlesApi } from "@/features/feed/articles/api";
import { categoryToSlug } from "@/features/feed/categories/constants";

import type { ArticleItem } from "@/features/feed/articles/types";

const CATEGORY_PREVIEW_LIMIT = 10;

interface CategoryRowProps {
  category: string;
  sourceIds: string[];
  searchQuery?: string;
  hideMoreLink?: boolean;
  refreshKey?: number;
}

export function CategoryRow({ category, sourceIds, searchQuery, hideMoreLink, refreshKey }: CategoryRowProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleArticleRead = useCallback((articleId: number, isRead: boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, is_read: isRead } : a)),
    );
  }, []);

  useEffect(() => {
    if (sourceIds.length === 0) return;

    setLoading(true);
    listArticlesApi({
      source: sourceIds.join(","),
      search: searchQuery || undefined,
      limit: CATEGORY_PREVIEW_LIMIT,
    })
      .then((result) => setArticles(result.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sourceIds, searchQuery, refreshKey]);

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 sm:w-80">
              <ArticleCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{category}</h2>
        {!hideMoreLink && (
          <Link
            href={`/category/${categoryToSlug(category)}`}
            className="text-sm text-gray-500 transition-colors hover:text-foreground"
          >
            더보기 &gt;
          </Link>
        )}
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="w-72 shrink-0 snap-start sm:w-80"
          >
            <ArticleCard article={article} onRead={handleArticleRead} />
          </div>
        ))}
      </div>
    </section>
  );
}
