import axios from "axios";
import { toast } from "sonner";

import type { InternalAxiosRequestConfig, AxiosInstance } from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const AUTH_LOGOUT_EVENT = "auth-logout";

export function dispatchAuthLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

export { AUTH_LOGOUT_EVENT };

const BASE_URL = "";
const API_TIMEOUT = 30000;

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

function clearTokensAndLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  document.cookie = "access_token=; path=/; max-age=0";
  dispatchAuthLogout();
  toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // Show error toast for non-401 errors
    if (error.response?.status && error.response.status !== 401) {
      const errorMessage = error.response?.data?.message || "요청 처리 중 오류가 발생했습니다.";
      toast.error(errorMessage);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        clearTokensAndLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );
        const { access_token, refresh_token } = response.data.result;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        document.cookie = `access_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokensAndLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Network errors
    if (!error.response) {
      toast.error("네트워크 연결을 확인해주세요.");
    }

    return Promise.reject(error);
  },
);
