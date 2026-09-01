import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '../recommendationsApi';
import { useAuthStore } from '../../../store/authStore';

export function useRecommendations() {
  const userId = useAuthStore((s) => s.user?.id ?? '');

  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn:  () => recommendationsApi.getRecommendations(userId),
    enabled:  !!userId,
  });
}
