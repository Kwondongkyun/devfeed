"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, Check, ExternalLink } from "lucide-react";

import { cn, formatDate, isSafeUrl } from "@/lib/utils";
import { SourceBadge } from "@/components/feed/SourceBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { markArticleReadApi } from "@/features/feed/articles/api";

import type { ArticleItem } from "@/features/feed/articles/types";

interface ArticleCardProps {
  article: ArticleItem;
  layout?: "card" | "row";
  onRead?: (articleId: number, isRead: boolean) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: (articleId: number) => void;
}

export function ArticleCard({
  article,
  layout = "card",
  onRead,
  isBookmarked,
  onBookmarkToggle,
}: ArticleCardProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (user && !article.is_read) {
      onRead?.(article.id, true);
      markArticleReadApi(article.id).catch(() => {
        onRead?.(article.id, false);
      });
    }
  };

  const href = isSafeUrl(article.url) ? article.url : "#";
  const safeImageUrl =
    article.image_url && isSafeUrl(article.image_url)
      ? article.image_url
      : null;

  if (layout === "row") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(
          "group flex cursor-pointer items-center gap-4 bg-card px-6 py-4 transition-colors hover:bg-elevated",
          article.is_read && "opacity-50",
        )}
      >
        <div className="relative h-[72px] w-[120px] shrink-0 overflow-hidden rounded-[12px] bg-placeholder">
          {safeImageUrl && !imageError ? (
            <Image
              src={safeImageUrl}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[9px] text-muted-foreground">
                {article.source.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <SourceBadge
              name={article.source.name}
              type={article.source.type}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatDate(article.published_at)}
            </span>
            {article.is_read && (
              <span className="font-mono text-[9px] text-muted-foreground">
                읽음
              </span>
            )}
          </div>
          <p className="line-clamp-1 font-mono text-[13px] font-semibold text-foreground">
            {article.title}
          </p>
          {article.summary && (
            <p className="line-clamp-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
          )}
        </div>

        {user && onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(article.id);
            }}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-elevated"
          >
            <Bookmark
              className={cn(
                "h-4 w-4 transition-colors",
                isBookmarked
                  ? "fill-orange text-orange"
                  : "fill-none text-muted-foreground",
              )}
            />
          </button>
        )}
        {article.is_read ? (
          <div className="shrink-0 rounded-full bg-teal p-1">
            <Check className="h-3 w-3 text-text-dark" strokeWidth={3} />
          </div>
        ) : (
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-[16px] bg-card transition-all hover:ring-1 hover:ring-orange/30",
        article.is_read && "opacity-50",
      )}
    >
      <div className="relative h-[140px] w-full overflow-hidden bg-placeholder">
        {safeImageUrl && !imageError ? (
          <Image
            src={safeImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 288px, 320px"
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="select-none font-sans text-lg font-bold text-muted-foreground/30">
              {article.source.name}
            </p>
          </div>
        )}
        {article.is_read && (
          <div className="absolute right-2 top-2 rounded-full bg-teal p-1">
            <Check className="h-3 w-3 text-text-dark" strokeWidth={3} />
          </div>
        )}
        {user && onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(article.id);
            }}
            className="absolute left-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-background/70 backdrop-blur-sm transition-colors hover:bg-background/90"
          >
            <Bookmark
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isBookmarked
                  ? "fill-orange text-orange"
                  : "fill-none text-foreground",
              )}
            />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2">
          <SourceBadge name={article.source.name} type={article.source.type} />
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatDate(article.published_at)}
          </span>
        </div>
        <p className="line-clamp-2 font-mono text-base font-semibold leading-snug text-foreground">
          {article.title}
        </p>
        {article.summary && (
          <p className="line-clamp-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}
