import { useMutation } from '@tanstack/react-query';

import { recommendWithAI, type RecommendRequest, type RecommendResponse } from './recommend';

export function useRecommend() {
  return useMutation<RecommendResponse, Error, RecommendRequest>({
    mutationFn: recommendWithAI,
  });
}
