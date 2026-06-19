import type { RecommendRequest } from '../api/recommend';
import { COMPANION_LABEL, PREFERENCE_LABEL, TRANSPORT_LABEL } from './labels';
import type { DateRange, PlanningState } from './planningStore';

// 박/일 텍스트. 최대 7박8일은 서버에서 한 번 더 clamp 한다.
export function durationText(noSpecific: boolean, range: DateRange): string {
  if (noSpecific || !range.start) return '';
  if (!range.end || range.end === range.start) return '당일치기';
  const s = new Date(range.start);
  const e = new Date(range.end);
  const nights = Math.round((e.getTime() - s.getTime()) / 86400000);
  return `${nights}박${nights + 1}일`;
}

// PlanningState -> 서버 요청 바디. regionName 은 코스 요청 시 호출부에서 채운다.
export function buildRecommendRequest(plan: PlanningState): RecommendRequest {
  return {
    budget: plan.budget ?? '',
    duration: durationText(plan.noSpecificDate, plan.dateRange),
    startDate: plan.dateRange.start ?? '',
    endDate: plan.dateRange.end ?? plan.dateRange.start ?? '',
    companion: plan.companion ? COMPANION_LABEL[plan.companion] : '',
    purpose: plan.preferences.map((p) => PREFERENCE_LABEL[p]),
    transport: plan.transport ? TRANSPORT_LABEL[plan.transport] : '',
    excludeRegions: plan.excludeRegions,
  };
}
