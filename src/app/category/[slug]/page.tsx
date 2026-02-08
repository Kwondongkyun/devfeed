"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Newspaper } from "lucide-react";

import { Header } from "@/components/common/Header";
import { SortToggle } from "@/components/common/SortToggle";
import { ArticleCard } from "@/components/feed/ArticleCard";
import { ArticleCardSkeleton } from "@/components/feed/ArticleCardSkeleton";
import { SourceFilterChips } from "@/components/feed/SourceFilterChips";

import { listArticlesApi } from "@/features/feed/articles/api";
import { listSourcesApi } from "@/features/feed/sources/api";
import {
  slugToCategory,
  getSourceIdsForCategory,
} from "@/features/feed/categories/constants";

import type { ArticleItem } from "@/features/feed/articles/types";
import type { SourceItem } from "@/features/feed/sources/types";

const DEFAULT_PAGE_SIZE = 20;
const SKELETON_COUNT = 6;

type SortKey = "latest" | "oldest" | "unread";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "oldest", label: "오래된순" },
  { key: "unread", label: "안 읽은 글" },
];

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const category = slugToCategory(slug);

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(
    searchParams.get("source"),
  );
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const cursorRef = useRef<number | null>(null);
  const hasMoreRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const categorySources = useMemo(
    () => sources.filter((s) => s.category === category),
    [sources, category],
  );

  const sourceIds = useMemo(() => {
    if (activeSourceId) return [activeSourceId];
    return getSourceIdsForCategory(sources, category);
  }, [sources, category, activeSourceId]);

  const apiSort = sortKey === "oldest" ? "oldest" : "latest";

  useEffect(() => {
    listSourcesApi()
      .then(setSources)
      .catch(() => {});
  }, []);

  const fetchArticles = useCallback(
    async (reset: boolean, signal?: AbortSignal) => {
      if (loadingRef.current || sourceIds.length === 0) return;
      if (!reset && !hasMoreRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const result = await listArticlesApi({
          source: sourceIds.join(","),
          cursor: reset ? undefined : (cursorRef.current ?? undefined),
          limit: DEFAULT_PAGE_SIZE,
          sort: apiSort,
        });

        if (signal?.aborted) return;

        setArticles((prev) => {
          if (reset) return result.articles;
          const existingIds = new Set(prev.map((a) => a.id));
          const newArticles = result.articles.filter(
            (a) => !existingIds.has(a.id),
          );
          return [...prev, ...newArticles];
        });
        cursorRef.current = result.next_cursor;
        hasMoreRef.current = result.has_more;
      } catch {
        // error handled by interceptor
      } finally {
        loadingRef.current = false;
        if (!signal?.aborted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [sourceIds, apiSort],
  );

  useEffect(() => {
    if (sourceIds.length === 0) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setArticles([]);
    cursorRef.current = null;
    hasMoreRef.current = true;
    loadingRef.current = false;
    setInitialLoading(true);
    fetchArticles(true, controller.signal);

    return () => controller.abort();
  }, [sourceIds, apiSort, fetchArticles]);

  useEffect(() => {
    if (!observerRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          fetchArticles(false);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, fetchArticles]);

  const handleArticleRead = useCallback((articleId: number, isRead: boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, is_read: isRead } : a)),
    );
  }, []);

  const handleSourceFilter = (sourceId: string | null) => {
    setActiveSourceId(sourceId);
  };

  const displayArticles = useMemo(() => {
    if (sortKey === "unread") {
      return [...articles].sort((a, b) => {
        if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
        return 0;
      });
    }
    return articles;
  }, [articles, sortKey]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center text-gray-500 transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">{category}</h1>
          </div>
          <SortToggle options={SORT_OPTIONS} value={sortKey} onChange={setSortKey} />
        </div>

        {categorySources.length > 1 && (
          <SourceFilterChips
            sources={categorySources}
            activeSourceId={activeSourceId}
            onChange={handleSourceFilter}
          />
        )}

        {initialLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Newspaper className="mb-4 h-16 w-16" strokeWidth={1} />
            <p className="text-lg font-medium">No articles found</p>
            <p className="mt-1 text-sm">
              Try fetching feeds first or adjust your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayArticles.map((article) => (
                <ArticleCard key={article.id} article={article} onRead={handleArticleRead} />
              ))}
            </div>
            <div ref={observerRef} className="flex justify-center py-8">
              {loading && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
