import { api } from "@/lib/api/axios";

import type {
  ArticleListResult,
  ListArticlesParams,
  ListArticlesResponse,
} from "./types";

export async function listArticlesApi(
  params: ListArticlesParams,
): Promise<ArticleListResult> {
  const query = new URLSearchParams();

  if (params.source) query.set("source", params.source);
  if (params.search) query.set("search", params.search);
  if (params.cursor) query.set("cursor", String(params.cursor));
  if (params.sort) query.set("sort", params.sort);
  query.set("limit", String(params.limit ?? 20));

  const response = await api.get<ListArticlesResponse>(
    `/api/v1/articles?${query}`,
  );
  return response.data.result;
}

export async function markArticleReadApi(articleId: number): Promise<void> {
  await api.post(`/api/v1/articles/${articleId}/read`);
}
