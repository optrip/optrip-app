export type Gender = 'female' | 'male';

export type Job = 'student' | 'employee' | 'self' | 'homemaker' | 'unemployed' | 'other';

export type Companion = 'alone' | 'friend' | 'partner' | 'parents' | 'kid' | 'other';

export type TransportMode = 'car' | 'public';

export type Preference =
  | 'healing'
  | 'food'
  | 'mood'
  | 'nature'
  | 'history'
  | 'activity'
  | 'culture'
  | 'cafe';

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
};
