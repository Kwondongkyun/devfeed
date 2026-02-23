"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";

import { cn, formatRelativeTime, isSafeUrl } from "@/lib/utils";
import { SourceBadge } from "@/components/feed/SourceBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { markArticleReadApi } from "@/features/feed/articles/api";

import type { ArticleItem } from "@/features/feed/articles/types";

interface ArticleCardProps {
  article: ArticleItem;
  layout?: "card" | "row";
  onRead?: (articleId: number, isRead: boolean) => void;
}

export function ArticleCard({ article, layout = "card", onRead }: ArticleCardProps) {
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
          "group flex items-center gap-4 bg-card px-6 py-4 transition-colors hover:bg-elevated",
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
            <SourceBadge name={article.source.name} type={article.source.type} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatRelativeTime(article.published_at)}
            </span>
            {article.is_read && (
              <span className="font-mono text-[9px] text-muted-foreground">// READ</span>
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
        "group flex flex-col overflow-hidden rounded-[16px] bg-card transition-all hover:ring-1 hover:ring-orange/30",
        article.is_read && "opacity-50",
      )}
    >
      <div className="relative h-[140px] w-full overflow-hidden bg-placeholder">
        {safeImageUrl && !imageError ? (
          <Image
            src={safeImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2">
          <SourceBadge name={article.source.name} type={article.source.type} />
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatRelativeTime(article.published_at)}
          </span>
        </div>
        <p className="line-clamp-2 font-mono text-[13px] font-semibold leading-snug text-foreground">
          {article.title}
        </p>
        {article.summary && (
          <p className="line-clamp-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}
