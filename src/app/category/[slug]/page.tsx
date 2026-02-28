"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Newspaper, Code, Brain, Globe, Loader } from "lucide-react";

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
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_ICONS,
} from "@/features/feed/categories/constants";

import type { ArticleItem } from "@/features/feed/articles/types";
import type { SourceItem } from "@/features/feed/sources/types";

const DEFAULT_PAGE_SIZE = 20;
const SKELETON_COUNT = 6;

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  brain: Brain,
  globe: Globe,
};

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
  const [hasMore, setHasMore] = useState(true);
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
      .catch(() => {
        // Error handled by axios interceptor
      });
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
        setHasMore(result.has_more);
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
    setHasMore(true);
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

  const displayName = CATEGORY_DISPLAY_NAMES[category] || category;
  const iconName = CATEGORY_ICONS[category] || "code";
  const IconComponent = ICON_MAP[iconName] || Code;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-elevated text-foreground transition-colors hover:bg-placeholder"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="font-sans text-2xl font-bold text-orange">DEVFEED</span>
          <span className="font-mono text-sm text-muted-foreground">/</span>
          <span className="font-sans text-lg font-semibold uppercase">{displayName}</span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="h-6 w-6 text-teal" />
            <h1 className="font-sans text-2xl font-bold uppercase tracking-wide">
              {displayName}
            </h1>
            <span className="rounded-full bg-elevated px-3 py-1 font-mono text-xs text-muted-foreground">
              {articles.length}개의 글
            </span>
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
          <div className="flex flex-col gap-[1px] overflow-hidden rounded-[16px]">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ArticleCardSkeleton key={i} layout="row" />
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Newspaper className="mb-4 h-16 w-16" strokeWidth={1} />
            <p className="font-sans text-lg font-semibold">아티클이 없습니다</p>
            <p className="mt-1 font-mono text-xs">
              새 글 가져오기를 실행하거나 필터를 조정해보세요
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-[1px] overflow-hidden rounded-[16px]">
              {displayArticles.map((article) => (
                <ArticleCard key={article.id} article={article} layout="row" onRead={handleArticleRead} />
              ))}
            </div>
            <div ref={observerRef} className="flex justify-center py-8">
              {loading ? (
                <div className="flex items-center gap-2 rounded-[16px] bg-card px-6 py-3">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">더 불러오는 중...</span>
                </div>
              ) : !hasMore && articles.length > 0 ? (
                <p className="font-mono text-xs text-muted-foreground">
                  모든 글을 확인했습니다
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
