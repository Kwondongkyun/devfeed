"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Code, Brain, Globe } from "lucide-react";

import { ArticleCard } from "@/components/feed/ArticleCard";
import { ArticleCardSkeleton } from "@/components/feed/ArticleCardSkeleton";
import { listArticlesApi } from "@/features/feed/articles/api";
import {
  categoryToSlug,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_ICONS,
} from "@/features/feed/categories/constants";

import type { ArticleItem } from "@/features/feed/articles/types";

const CATEGORY_PREVIEW_LIMIT = 10;

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  brain: Brain,
  globe: Globe,
};

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
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleArticleRead = useCallback((articleId: number, isRead: boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, is_read: isRead } : a)),
    );
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: "200px" }, // Start loading 200px before visible
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || sourceIds.length === 0) return;

    setLoading(true);
    listArticlesApi({
      source: sourceIds.join(","),
      search: searchQuery || undefined,
      limit: CATEGORY_PREVIEW_LIMIT,
    })
      .then((result) => setArticles(result.articles))
      .catch(() => {
        // Error handled by axios interceptor
      })
      .finally(() => setLoading(false));
  }, [isVisible, sourceIds, searchQuery, refreshKey]);

  const displayName = CATEGORY_DISPLAY_NAMES[category] || category;
  const iconName = CATEGORY_ICONS[category] || "code";
  const IconComponent = ICON_MAP[iconName] || Code;

  if (loading) {
    return (
      <section ref={sectionRef} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-placeholder" />
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
    <section ref={sectionRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-teal" />
          <h2 className="font-sans text-xl font-semibold uppercase tracking-wide">
            {displayName}
          </h2>
          <span className="rounded-full bg-elevated px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {articles.length}
          </span>
        </div>
        {!hideMoreLink && (
          <Link
            href={`/category/${categoryToSlug(category)}`}
            className="font-mono text-[11px] text-orange transition-colors hover:text-orange/80"
          >
            view_all &gt;
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
