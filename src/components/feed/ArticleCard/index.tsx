"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import { cn, formatRelativeTime, isSafeUrl } from "@/lib/utils";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SourceBadge } from "@/components/feed/SourceBadge";

import type { ArticleItem } from "@/features/feed/articles/types";
import { useAuth } from "@/features/auth/AuthContext";
import { markArticleReadApi } from "@/features/feed/articles/api";

interface ArticleCardProps {
  article: ArticleItem;
  onRead?: (articleId: number, isRead: boolean) => void;
}

export function ArticleCard({ article, onRead }: ArticleCardProps) {
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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border transition-all",
        article.is_read
          ? "border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800/50 dark:bg-gray-900/50"
          : "border-gray-200 bg-white hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700",
      )}
    >
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="select-none text-2xl font-bold text-muted-foreground/30">
            {article.source.name}
          </p>
        </div>
        {safeImageUrl && !imageError && (
          <Image
            src={safeImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}
        {article.is_read && (
          <div className="absolute right-2 top-2 rounded-full bg-green-500/80 p-1">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <SourceBadge name={article.source.name} type={article.source.type} />
          <span className="text-xs text-gray-400">
            {formatRelativeTime(article.published_at)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {article.title}
        </p>
        {article.summary && (
          <p className="line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {article.summary}
          </p>
        )}
        {article.author && (
          <p className="mt-auto pt-2 text-xs text-gray-400">
            by {article.author}
          </p>
        )}
      </div>
    </a>
  );
}
