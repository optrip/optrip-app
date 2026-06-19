import type { Companion, Preference, TransportMode } from '../navigation/types';

export const COMPANION_LABEL: Record<Companion, string> = {
  alone: '혼자',
  friend: '친구와',
  partner: '애인과',
  parents: '부모님과',
  kid: '아이와',
  other: '기타',
};

export const PREFERENCE_LABEL: Record<Preference, string> = {
  healing: '힐링',
  food: '맛집',
  mood: '감성/사진',
  nature: '자연/풍경',
  history: '역사/문화',
  activity: '액티비티',
  culture: '문화체험',
  cafe: '카페투어',
};

export const TRANSPORT_LABEL: Record<TransportMode, string> = {
  car: '자동차',
  public: '대중교통',
};
