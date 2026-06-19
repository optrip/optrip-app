import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Gender, Job } from '../navigation/types';
import { loadJSON, removeKey, saveJSON } from './storage';

export type OnboardingProfile = {
  name: string;
  gender: Gender | null;
  birthYear: string;
  job: Job | null;
};

// 저장소에 영속되는 형태: 프로필 + 온보딩 완료 여부
type PersistedOnboarding = {
  profile: OnboardingProfile;
  onboarded: boolean;
};

type OnboardingContextValue = {
  profile: OnboardingProfile;
  onboarded: boolean; // 온보딩을 한 번이라도 끝냈는지
  hydrated: boolean; // 저장소에서 불러오기 완료 여부
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setBirthYear: (v: string) => void;
  setJob: (v: Job) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const STORAGE_KEY = 'optrip.onboarding';

const initial: OnboardingProfile = {
  name: '',
  gender: null,
  birthYear: '',
  job: null,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initial);
  const [onboarded, setOnboarded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // 최초 1회: 저장소에서 복원
  useEffect(() => {
    let active = true;
    loadJSON<PersistedOnboarding>(STORAGE_KEY).then((stored) => {
      if (!active) return;
      if (stored) {
        setProfile({ ...initial, ...stored.profile });
        setOnboarded(!!stored.onboarded);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // 변경 시 저장 (복원 완료 후에만)
  useEffect(() => {
    if (!hydrated) return;
    saveJSON<PersistedOnboarding>(STORAGE_KEY, { profile, onboarded });
  }, [profile, onboarded, hydrated]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      profile,
      onboarded,
      hydrated,
      setName: (name) => setProfile((p) => ({ ...p, name })),
      setGender: (gender) => setProfile((p) => ({ ...p, gender })),
      setBirthYear: (birthYear) => setProfile((p) => ({ ...p, birthYear })),
      setJob: (job) => setProfile((p) => ({ ...p, job })),
      completeOnboarding: () => setOnboarded(true),
      resetOnboarding: () => {
        setProfile(initial);
        setOnboarded(false);
        removeKey(STORAGE_KEY);
      },
    }),
    [profile, onboarded, hydrated],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
