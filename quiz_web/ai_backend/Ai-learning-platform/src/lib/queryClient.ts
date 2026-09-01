import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '../types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't re-fetch on window focus in prod — unexpected for gov users
      refetchOnWindowFocus: false,
      // 5-minute stale time — competency data doesn't change by the second
      staleTime: 5 * 60 * 1000,
      // 10-minute cache lifetime
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        const apiError = error as ApiError;
        // Don't retry on 4xx errors (client mistakes)
        if (apiError.status >= 400 && apiError.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
