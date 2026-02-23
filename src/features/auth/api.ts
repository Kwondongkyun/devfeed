import { api } from "@/lib/api/axios";

import type {
  AuthResponse,
  FavoriteSourcesResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  TokenResponse,
  User,
} from "./types";

export async function registerApi(
  data: RegisterRequest,
): Promise<TokenResponse> {
  const response = await api.post<AuthResponse>("/api/v1/auth/register", data);
  return response.data.result;
}

export async function loginApi(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<AuthResponse>("/api/v1/auth/login", data);
  return response.data.result;
}

export async function refreshTokenApi(
  refresh_token: string,
): Promise<TokenResponse> {
  const response = await api.post<AuthResponse>("/api/v1/auth/refresh", {
    refresh_token,
  });
  return response.data.result;
}

export async function getMeApi(): Promise<User> {
  const response = await api.get<MeResponse>("/api/v1/auth/me");
  return response.data.result;
}

export async function listFavoriteSourcesApi(): Promise<string[]> {
  const response = await api.get<FavoriteSourcesResponse>(
    "/api/v1/auth/favorites/sources",
  );
  return response.data.result;
}

export async function addFavoriteSourceApi(sourceId: string): Promise<void> {
  await api.post(`/api/v1/auth/favorites/sources/${sourceId}`);
}

export async function removeFavoriteSourceApi(
  sourceId: string,
): Promise<void> {
  await api.delete(`/api/v1/auth/favorites/sources/${sourceId}`);
}
