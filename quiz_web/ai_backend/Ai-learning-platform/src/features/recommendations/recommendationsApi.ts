import { apiClient } from '../../lib/apiClient';
import type { Recommendation } from '../../types/api';

export const recommendationsApi = {
  getRecommendations: (userId: string) =>
    apiClient.get<Recommendation[]>(`/recommendations/${userId}`).then((r) => r.data),
};
