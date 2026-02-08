import type { BaseResponse } from "@/features/shared/response";

export interface FetchFeedsResult {
  success: boolean;
  inserted: number;
  total_fetched: number;
  duplicates_skipped: number;
  timestamp: string;
}

export type FetchFeedsResponse = BaseResponse<FetchFeedsResult>;
