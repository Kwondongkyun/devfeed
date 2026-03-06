"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

import { Header } from "@/components/common/Header";
import { SearchBar } from "@/components/feed/SearchBar";
import { CategoryRow } from "@/components/feed/CategoryRow";
import { useAuth } from "@/features/auth/AuthContext";
import { listFavoriteSourcesApi } from "@/features/auth/api";
import { listSourcesApi } from "@/features/feed/sources/api";
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
        {!user && (
          <div className="mb-6 flex items-center rounded-[16px] bg-card px-5 py-4">
            <p className="font-mono text-xs text-muted-foreground">
              로그인하면 즐겨찾기 및 맞춤 피드를 이용할 수 있습니다
            </p>
          </div>
        )}
        <div className="mb-8">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="flex flex-col gap-10">
          {user && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange" />
                  <h2 className="font-sans text-xl font-semibold">
                    즐겨찾기
                  </h2>
                </div>
                {favoriteSourceIds.size > 0 && (
                  <Link
                    href="/mypage"
                    className="cursor-pointer font-mono text-[11px] text-orange transition-colors hover:text-orange/80"
                  >
                    관리 &gt;
                  </Link>
                )}
              </div>
              {favoriteSourceIds.size === 0 ? (
                <div className="flex items-center justify-center rounded-[16px] bg-card py-8">
                  <p className="font-mono text-xs text-muted-foreground">
                    즐겨찾기한 소스가 없습니다.{" "}
                    <Link href="/mypage" className="cursor-pointer text-orange underline-offset-2 hover:underline">
                      소스를 추가해보세요!
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                  {sources
                    .filter((s) => favoriteSourceIds.has(s.id))
                    .map((source) => (
                      <Link
                        key={source.id}
                        href={`/category/${categoryToSlug(source.category)}?source=${source.id}`}
                        className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-[16px] bg-card px-4 py-3 transition-colors hover:bg-elevated"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-sm ${SOURCE_DOT_COLORS[source.type] || "bg-placeholder"}`}
                        />
                        <span className="font-mono text-[13px] text-foreground">
                          {source.name}
                        </span>
                      </Link>
                    ))}
                </div>
              )}
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
