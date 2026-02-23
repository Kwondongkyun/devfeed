import { api } from "@/lib/api/axios";

import type { ListSourcesResponse, SourceItem } from "./types";

export async function listSourcesApi(): Promise<SourceItem[]> {
  const response = await api.get<ListSourcesResponse>("/api/v1/sources");
  return response.data.result;
}
