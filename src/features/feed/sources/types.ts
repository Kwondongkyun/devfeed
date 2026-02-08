import type { BaseResponse } from "@/features/shared/response";

export type SourceType = "rss" | "hackernews" | "devto";

export interface SourceItem {
  id: string;
  name: string;
  type: SourceType;
  category: string;
  icon_url: string | null;
  latest_published_at: string | null;
}

export type ListSourcesResponse = BaseResponse<SourceItem[]>;
