import { apiClient } from '../../lib/apiClient';
import type { CompetencyGapSummary } from '../../types/api';

export const competencyApi = {
  getGaps: (userId: string) =>
    apiClient.get<CompetencyGapSummary>(`/competency-gaps/${userId}`).then((r) => r.data),
};
