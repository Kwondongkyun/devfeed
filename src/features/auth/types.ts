import type { BaseResponse } from "@/features/shared/response";

export interface User {
  id: number;
  email: string;
  nickname: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type AuthResponse = BaseResponse<TokenResponse>;
export type MeResponse = BaseResponse<User>;
export type FavoriteSourcesResponse = BaseResponse<string[]>;
