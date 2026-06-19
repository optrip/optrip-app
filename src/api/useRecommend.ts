import { useMutation } from '@tanstack/react-query';

import {
  recommendRegion,
  recommendCourses,
  type RecommendRequest,
  type RegionResponse,
  type CourseListResponse,
} from './recommend';

// 지역 추천 (Image #1) — 최초 추천 + "다시 받기"
export function useRecommendRegion() {
  return useMutation<RegionResponse, Error, RecommendRequest>({
    mutationFn: recommendRegion,
  });
}

// 코스 추천 (Image #2, #3) — 선택 지역의 purpose 별 코스 + 일자별 상세 일괄 생성
export function useRecommendCourses() {
  return useMutation<CourseListResponse, Error, RecommendRequest>({
    mutationFn: recommendCourses,
  });
}
