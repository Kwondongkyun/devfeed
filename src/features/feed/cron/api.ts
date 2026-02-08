import { api } from "@/lib/api/axios";
import type { FetchFeedsResponse, FetchFeedsResult } from "./types";

export async function fetchFeedsApi(): Promise<FetchFeedsResult> {
  const response = await api.post<FetchFeedsResponse>(
    "/api/v1/cron/fetch-feeds",
  );
  return response.data.result;
}
