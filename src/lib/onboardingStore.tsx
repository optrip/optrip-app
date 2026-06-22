import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Gender, Job } from '../navigation/types';
import type { Course } from '../api/recommend';

// course/regionName 은 히스토리에서 카드를 눌러 코스 상세를 다시 그릴 때 사용
export type SavedTrip = { id: string; title: string; desc: string; image: string; course: Course; regionName: string };
export type OnboardingProfile = { name: string; gender: Gender | null; birthYear: string; job: Job | null; };

type OnboardingContextValue = {
  profile: OnboardingProfile;
  onboarded: boolean;
  savedTrips: SavedTrip[];
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setBirthYear: (v: string) => void;
  setJob: (v: Job) => void;
  completeOnboarding: () => void;
  saveTrip: (trip: Omit<SavedTrip, 'id'>) => void;
  // 초기화 함수는 이제 필요 없지만, 혹시 나중에 쓰실까봐 남겨둡니다.
  resetOnboarding: () => void; 
};

const initial: OnboardingProfile = { name: '', gender: null, birthYear: '', job: null };
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initial);
  const [onboarded, setOnboarded] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  // 이제 useEffect로 저장하거나 불러오는 작업이 없습니다!
  // 즉, 앱을 켤 때마다 항상 초기 상태인 'false'와 빈 데이터로 시작합니다.

  const value = useMemo<OnboardingContextValue>(() => ({
    profile, onboarded, savedTrips,
    setName: (name) => setProfile((p) => ({ ...p, name })),
    setGender: (gender) => setProfile((p) => ({ ...p, gender })),
    setBirthYear: (birthYear) => setProfile((p) => ({ ...p, birthYear })),
    setJob: (job) => setProfile((p) => ({ ...p, job })),
    completeOnboarding: () => setOnboarded(true),
    saveTrip: (trip) => setSavedTrips((prev) => [{ ...trip, id: Date.now().toString() }, ...prev]),
    resetOnboarding: () => {
      setProfile(initial);
      setOnboarded(false);
      setSavedTrips([]);
    },
  }), [profile, onboarded, savedTrips]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}