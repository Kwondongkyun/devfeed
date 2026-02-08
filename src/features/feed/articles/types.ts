import type { BaseResponse } from "@/features/shared/response";

import type { SourceType } from "@/features/feed/sources/types";

export interface ArticleSource {
  name: string;
  type: SourceType;
  icon_url: string | null;
}

export interface ArticleItem {
  id: number;
  title: string;
  url: string;
  summary: string | null;
  image_url: string | null;
  author: string | null;
  category: string | null;
  published_at: string;
  source_id: string;
  source: ArticleSource;
  is_read: boolean;
}

export interface ArticleListResult {
  articles: ArticleItem[];
  next_cursor: number | null;
  has_more: boolean;
}

export type ListArticlesResponse = BaseResponse<ArticleListResult>;

export interface ListArticlesParams {
  source?: string;
  search?: string;
  cursor?: number;
  limit?: number;
  sort?: "latest" | "oldest";
}
