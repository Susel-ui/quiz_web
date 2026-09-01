import { useQuery } from '@tanstack/react-query';
import { competencyApi } from '../competencyApi';
import { useAuthStore } from '../../../store/authStore';

export function useCompetencyGaps() {
  const userId = useAuthStore((s) => s.user?.id ?? '');

  return useQuery({
    queryKey: ['competency-gaps', userId],
    queryFn:  () => competencyApi.getGaps(userId),
    enabled:  !!userId,
  });
}
