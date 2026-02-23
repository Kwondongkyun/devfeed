"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Star } from "lucide-react";

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

const SOURCE_DOT_COLORS: Record<string, string> = {
  hackernews: "bg-teal",
  devto: "bg-orange",
  rss: "bg-badge-blue",
};

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
      .catch(() => {
        // Error handled by axios interceptor
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteSourceIds(new Set());
      return;
    }
    listFavoriteSourcesApi()
      .then((ids) => setFavoriteSourceIds(new Set(ids)))
      .catch(() => {
        // Error handled by axios interceptor
      });
  }, [user]);

  const refreshData = useCallback(() => {
    listSourcesApi()
      .then(setSources)
      .catch(() => {
        // Error handled by axios interceptor
      });
    if (user) {
      listFavoriteSourcesApi()
        .then((ids) => setFavoriteSourceIds(new Set(ids)))
        .catch(() => {
        // Error handled by axios interceptor
      });
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onSearch={setSearchQuery} />
          {user && (
            <button
              onClick={handleFetchFeeds}
              disabled={fetching}
              className="inline-flex items-center gap-2 rounded-[16px] bg-orange px-5 py-2.5 font-mono text-xs font-semibold text-text-dark transition-colors hover:bg-orange/90 disabled:opacity-50"
            >
              {fetching ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-dark/30 border-t-text-dark" />
                  fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  fetch_feeds
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-10">
          {favoriteSourceIds.size > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange" />
                  <h2 className="font-sans text-xl font-semibold uppercase">
                    FAVORITES
                  </h2>
                </div>
                <Link
                  href="/mypage"
                  className="font-mono text-[11px] text-orange transition-colors hover:text-orange/80"
                >
                  manage &gt;
                </Link>
              </div>
              <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                {sources
                  .filter((s) => favoriteSourceIds.has(s.id))
                  .map((source) => (
                    <Link
                      key={source.id}
                      href={`/category/${categoryToSlug(source.category)}?source=${source.id}`}
                      className="flex shrink-0 items-center gap-2.5 rounded-[16px] bg-card px-4 py-3 transition-colors hover:bg-elevated"
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-sm ${SOURCE_DOT_COLORS[source.type] || "bg-placeholder"}`}
                      />
                      <span className="font-mono text-[13px] text-foreground">
                        {source.name.toLowerCase().replace(/\s+/g, "_")}
                      </span>
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
