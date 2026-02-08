"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { cn, formatRelativeTime } from "@/lib/utils";

import { Header } from "@/components/common/Header";
import { SortToggle } from "@/components/common/SortToggle";
import { useAuth } from "@/features/auth/AuthContext";
import {
  addFavoriteSourceApi,
  listFavoriteSourcesApi,
  removeFavoriteSourceApi,
} from "@/features/auth/api";
import { listSourcesApi } from "@/features/feed/sources/api";
import type { SourceItem } from "@/features/feed/sources/types";
import { CATEGORY_ORDER } from "@/features/feed/categories/constants";

type SortKey = "latest" | "name" | "favorite";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "name", label: "이름순" },
  { key: "favorite", label: "즐겨찾기순" },
];

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const favoriteIdsRef = useRef(favoriteIds);
  favoriteIdsRef.current = favoriteIds;
  const togglingIdsRef = useRef(togglingIds);
  togglingIdsRef.current = togglingIds;

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
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">마이페이지</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              즐겨찾기한 소스의 아티클을 더 빠르게 확인하세요.
            </p>
          </div>
          <SortToggle options={SORT_OPTIONS} value={sortKey} onChange={setSortKey} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {sourcesByCategory.map(({ category, sources: catSources }) => (
              <section key={category}>
                <h2 className="mb-4 text-lg font-semibold">{category}</h2>
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
                          "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                          isFav
                            ? "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600",
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400 dark:bg-gray-800">
                            {source.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {source.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(source.latest_published_at, "아티클 없음")}
                          </p>
                        </div>
                        <Star
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isFav
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-none text-gray-300 dark:text-gray-600",
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
      </main>
    </div>
  );
}
