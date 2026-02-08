"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Header } from "@/components/common/Header";
import { SearchBar } from "@/components/feed/SearchBar";
import { CategoryRow } from "@/components/feed/CategoryRow";

import { useAuth } from "@/features/auth/AuthContext";
import { listFavoriteSourcesApi } from "@/features/auth/api";
import { listSourcesApi } from "@/features/feed/sources/api";
import { fetchFeedsApi } from "@/features/feed/cron/api";
import {
  CATEGORY_ORDER,
  categoryToSlug,
  getSourceIdsForCategory,
} from "@/features/feed/categories/constants";

import type { SourceItem } from "@/features/feed/sources/types";

export default function Home() {
  const { user } = useAuth();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [favoriteSourceIds, setFavoriteSourceIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [fetching, setFetching] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    listSourcesApi()
      .then(setSources)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteSourceIds(new Set());
      return;
    }
    listFavoriteSourcesApi()
      .then((ids) => setFavoriteSourceIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const refreshData = useCallback(() => {
    listSourcesApi()
      .then(setSources)
      .catch(() => {});
    if (user) {
      listFavoriteSourcesApi()
        .then((ids) => setFavoriteSourceIds(new Set(ids)))
        .catch(() => {});
    }
  }, [user]);

  const handleFetchFeeds = useCallback(async () => {
    setFetching(true);
    try {
      await fetchFeedsApi();
      refreshData();
      setRefreshKey((k) => k + 1);
    } catch {
      // error handled by interceptor
    } finally {
      setFetching(false);
    }
  }, [refreshData]);

  const categorySourceIds = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      sourceIds: getSourceIdsForCategory(sources, category),
    }));
  }, [sources]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onSearch={setSearchQuery} />
          {user && (
            <button
              onClick={handleFetchFeeds}
              disabled={fetching}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {fetching ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Fetch Feeds
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-8">
          {favoriteSourceIds.size > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">즐겨찾기</h2>
              <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                {sources
                  .filter((s) => favoriteSourceIds.has(s.id))
                  .map((source) => (
                    <Link
                      key={source.id}
                      href={`/category/${categoryToSlug(source.category)}?source=${source.id}`}
                      className="flex shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600"
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
                      <div>
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {source.category}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
          {categorySourceIds.map(({ category, sourceIds }) => (
            <CategoryRow
              key={category}
              category={category}
              sourceIds={sourceIds}
              searchQuery={searchQuery}
              refreshKey={refreshKey}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
