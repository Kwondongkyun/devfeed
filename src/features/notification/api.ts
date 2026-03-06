import { api } from "@/lib/api/axios";

import type { Notification } from "./types";

interface ApiResponse<T> {
  success: boolean;
  result: T;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await api.get<ApiResponse<Notification[]>>(
    "/api/v1/auth/notifications",
  );
  return response.data.result;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<{ count: number }>>(
    "/api/v1/auth/notifications/unread-count",
  );
  return response.data.result.count;
}

export async function markAsRead(
  params: { notificationIds: number[] } | { all: true },
): Promise<void> {
  await api.post("/api/v1/auth/notifications/read", params);
}
