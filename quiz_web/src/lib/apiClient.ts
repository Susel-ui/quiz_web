/**
 * apiClient.ts — Axios instance with interceptors.
 *
 * Responsibilities:
 *  1. Attach Authorization header from Zustand auth store on every request.
 *  2. Auto-refresh access token on 401 (single retry).
 *  3. Normalise error shape to ApiError so callers don't handle raw axios errors.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, AuthTokens } from '../types/api';

// Base URL — swap VITE_API_BASE_URL in .env to point at real backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL:        BASE_URL,
  timeout:        15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — inject access token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Late import to avoid circular dependency with the store file
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401 + normalise errors ────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue requests that come in while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshTokens();
        storeTokens(newTokens);
        processQueue(null, newTokens.accessToken);
        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise to ApiError shape
    const apiError: ApiError = {
      status:  error.response?.status ?? 0,
      message: (error.response?.data as { message?: string })?.message ?? error.message,
      code:    (error.response?.data as { code?: string })?.code,
    };
    return Promise.reject(apiError);
  },
);

// ── Token helpers — kept here to avoid circular imports ──────────────────────
const TOKEN_KEY   = 'igot_access_token';
const REFRESH_KEY = 'igot_refresh_token';

function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_KEY,   tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, { refreshToken });
  return data;
}

export { storeTokens, clearTokens };
