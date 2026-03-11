"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Star, Loader } from "lucide-react";

import { cn, formatRelativeTime } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { SortToggle } from "@/components/common/SortToggle";
import { ArticleCard } from "@/components/feed/ArticleCard";
import { useAuth } from "@/features/auth/AuthContext";
import {
  addBookmarkApi,
  addFavoriteSourceApi,
  listBookmarksApi,
  listFavoriteSourcesApi,
  removeBookmarkApi,
  removeFavoriteSourceApi,
} from "@/features/auth/api";
import { listArticlesApi } from "@/features/feed/articles/api";
import { listSourcesApi } from "@/features/feed/sources/api";
import {
  CATEGORY_ORDER,
  CATEGORY_DISPLAY_NAMES,
} from "@/features/feed/categories/constants";

import type { ArticleItem } from "@/features/feed/articles/types";
import type { SourceItem } from "@/features/feed/sources/types";

type SortKey = "latest" | "name" | "favorite";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "name", label: "이름순" },
  { key: "favorite", label: "즐겨찾기" },
];

type TabKey = "sources" | "bookmarks";

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const initialTab = searchParams.get("tab") === "bookmarks" ? "bookmarks" : "sources";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const favoriteIdsRef = useRef(favoriteIds);
  favoriteIdsRef.current = favoriteIds;
  const togglingIdsRef = useRef(togglingIds);
  togglingIdsRef.current = togglingIds;

  // 북마크 탭 상태
  const [bookmarkedArticles, setBookmarkedArticles] = useState<ArticleItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const bookmarkedIdsRef = useRef(bookmarkedIds);
  bookmarkedIdsRef.current = bookmarkedIds;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchData() {
      try {
        const [sourcesData, favoritesData] = await Promise.all([
          listSourcesApi(),
          listFavoriteSourcesApi(),
        ]);
        setSources(sourcesData);
        setFavoriteIds(new Set(favoritesData));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoading, user]);

  // 북마크 탭 데이터 로드
  useEffect(() => {
    if (authLoading || !user || activeTab !== "bookmarks") return;

    setBookmarksLoading(true);
    listBookmarksApi()
      .then(async (bmIds) => {
        setBookmarkedIds(new Set(bmIds));
        if (bmIds.length === 0) {
          setBookmarkedArticles([]);
          return;
        }
        const result = await listArticlesApi({ limit: 100 });
        setBookmarkedArticles(result.articles.filter((a) => bmIds.includes(a.id)));
      })
      .catch(() => {})
      .finally(() => setBookmarksLoading(false));
  }, [authLoading, user, activeTab]);

  const handleBookmarkToggle = useCallback(async (articleId: number) => {
    const isBookmarked = bookmarkedIdsRef.current.has(articleId);

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(articleId);
      else next.add(articleId);
      return next;
    });

    if (isBookmarked) {
      setBookmarkedArticles((prev) => prev.filter((a) => a.id !== articleId));
    }

    try {
      if (isBookmarked) await removeBookmarkApi(articleId);
      else await addBookmarkApi(articleId);
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });
    }
  }, []);

  const handleToggleFavorite = async (sourceId: string) => {
    if (togglingIdsRef.current.has(sourceId)) return;

    setTogglingIds((prev) => new Set(prev).add(sourceId));
    const isFav = favoriteIdsRef.current.has(sourceId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });

    try {
      if (isFav) {
        await removeFavoriteSourceApi(sourceId);
      } else {
        await addFavoriteSourceApi(sourceId);
      }
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(sourceId);
        } else {
          next.delete(sourceId);
        }
        return next;
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  };

  const sourcesByCategory = useMemo(() => {
    const sortItems = (items: SourceItem[]) => {
      const sorted = [...items];
      switch (sortKey) {
        case "latest":
          sorted.sort((a, b) => {
            const aDate = a.latest_published_at || "";
            const bDate = b.latest_published_at || "";
            return bDate.localeCompare(aDate);
          });
          break;
        case "name":
          sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
          break;
        case "favorite":
          sorted.sort((a, b) => {
            const aFav = favoriteIds.has(a.id) ? 0 : 1;
            const bFav = favoriteIds.has(b.id) ? 0 : 1;
            if (aFav !== bFav) return aFav - bFav;
            const aDate = a.latest_published_at || "";
            const bDate = b.latest_published_at || "";
            return bDate.localeCompare(aDate);
          });
          break;
      }
      return sorted;
    };

    return CATEGORY_ORDER.map((category) => ({
      category,
      sources: sortItems(
        sources.filter((s) => s.category === category),
      ),
    })).filter((g) => g.sources.length > 0);
  }, [sources, sortKey, favoriteIds]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 lg:px-12">
        {/* 탭 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-6 border-b border-border">
            <button
              onClick={() => setActiveTab("sources")}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-1 pb-3 font-sans text-sm font-semibold transition-colors",
                activeTab === "sources"
                  ? "border-orange text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className="h-4 w-4" />
              내 소스
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-1 pb-3 font-sans text-sm font-semibold transition-colors",
                activeTab === "bookmarks"
                  ? "border-orange text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Bookmark className="h-4 w-4" />
              저장한 글
            </button>
          </div>
        </div>

        {/* 내 소스 탭 */}
        {activeTab === "sources" && (
          <>
            <div className="mb-6 flex items-end justify-between">
              <p className="font-mono text-xs text-muted-foreground">
                즐겨찾는 소스를 관리해보세요
              </p>
              <SortToggle options={SORT_OPTIONS} value={sortKey} onChange={setSortKey} />
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-10">
                {favoriteIds.size === 0 && (
                  <div className="flex items-center justify-center rounded-[16px] bg-card py-10">
                    <p className="font-mono text-xs text-muted-foreground">
                      즐겨찾기한 소스가 없습니다. 소스를 눌러 즐겨찾기에 추가해보세요!
                    </p>
                  </div>
                )}
                {sourcesByCategory.map(({ category, sources: catSources }) => (
                  <section key={category}>
                    <h2 className="mb-4 font-sans text-lg font-semibold uppercase">
                      {CATEGORY_DISPLAY_NAMES[category] || category}
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {catSources.map((source) => {
                        const isFav = favoriteIds.has(source.id);
                        const isToggling = togglingIds.has(source.id);
                        return (
                          <button
                            key={source.id}
                            onClick={() => handleToggleFavorite(source.id)}
                            disabled={isToggling}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-[16px] border p-4 text-left transition-all",
                              isFav
                                ? "border-orange/50 bg-orange/10"
                                : "border-border bg-card hover:border-orange/30",
                              isToggling && "opacity-50",
                            )}
                          >
                            {source.icon_url ? (
                              <Image
                                src={source.icon_url}
                                alt=""
                                width={32}
                                height={32}
                                className="rounded-lg object-contain"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated font-mono text-xs font-bold text-muted-foreground">
                                {source.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm font-medium text-foreground">
                                {source.name}
                              </p>
                              <p className="font-mono text-[11px] text-muted-foreground">
                                {formatRelativeTime(source.latest_published_at, "아티클 없음")}
                              </p>
                            </div>
                            <Star
                              className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                isFav
                                  ? "fill-orange text-orange"
                                  : "fill-none text-placeholder",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {/* 저장한 글 탭 */}
        {activeTab === "bookmarks" && (
          <>
            {bookmarksLoading ? (
              <div className="flex justify-center py-16">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookmarkedArticles.length === 0 ? (
              <div className="flex items-center justify-center rounded-[16px] bg-card py-10">
                <p className="font-mono text-xs text-muted-foreground">
                  저장한 글이 없습니다
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[16px] bg-card">
                {bookmarkedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layout="row"
                    isBookmarked={bookmarkedIds.has(article.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
