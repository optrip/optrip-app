export type Gender = 'female' | 'male';

export type Job = 'student' | 'employee' | 'self' | 'homemaker' | 'unemployed' | 'other';

export type Companion = 'alone' | 'friend' | 'partner' | 'parents' | 'kid' | 'other';

export type TransportMode = 'car' | 'public';

// 추구미 12개. 화면엔 평면 그리드로만 노출되고,
// 카테고리(자연·휴식 등) 묶음은 서버에서 처리한다.
export type Preference =
  | 'healing' // 힐링
  | 'nature' // 자연/풍경
  | 'sea' // 바다
  | 'food' // 맛집
  | 'cafe' // 카페투어
  | 'market' // 시장/먹거리
  | 'history' // 역사/문화
  | 'culture' // 문화체험
  | 'activity' // 액티비티
  | 'hiking' // 하이킹/트레킹
  | 'photo' // 감성/사진
  | 'nightview'; // 야경

export type OnboardingStackParamList = {
  Welcome: undefined;
  Intro: undefined;
  InfoNotice: undefined;
  NameInput: undefined;
  GenderSelect: undefined;
  BirthYear: undefined;
  JobSelect: undefined;
  Home: undefined;
  MyTrips: undefined;
  Budget: undefined;
  Schedule: undefined;
  Companion: undefined;
  Preference: undefined;
  Transport: undefined;
  Loading: undefined;
  Recommendation: undefined;
  CourseList: undefined;
  CourseDetail: { courseIndex: number };
  MyPage: undefined;
  EditProfile: { userInfo: { name: string; gender: string; birthYear: string } };
};
