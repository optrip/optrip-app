import type { Companion, Preference, TransportMode } from '../navigation/types';

export const COMPANION_LABEL: Record<Companion, string> = {
  alone: '혼자',
  friend: '친구와',
  partner: '애인과',
  parents: '부모님과',
  kid: '아이와',
  other: '기타',
};

// 서버로 보내는 정규 추구미 라벨(= 서버 카테고리 매핑 키). 장식용 공백 없이 유지한다.
export const PREFERENCE_LABEL: Record<Preference, string> = {
  healing: '힐링',
  nature: '자연/풍경',
  sea: '바다',
  food: '맛집',
  cafe: '카페투어',
  market: '시장/먹거리',
  history: '역사/문화',
  culture: '문화체험',
  activity: '액티비티',
  hiking: '하이킹/트레킹',
  photo: '감성/사진',
  nightview: '야경',
};

export const TRANSPORT_LABEL: Record<TransportMode, string> = {
  car: '자동차',
  public: '대중교통',
};
