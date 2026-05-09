import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

import type { Gender, Job } from '../navigation/types';

export type OnboardingProfile = {
  name: string;
  gender: Gender | null;
  birthYear: string;
  job: Job | null;
};

type OnboardingContextValue = {
  profile: OnboardingProfile;
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setBirthYear: (v: string) => void;
  setJob: (v: Job) => void;
};

const initial: OnboardingProfile = {
  name: '',
  gender: null,
  birthYear: '',
  job: null,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initial);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      profile,
      setName: (name) => setProfile((p) => ({ ...p, name })),
      setGender: (gender) => setProfile((p) => ({ ...p, gender })),
      setBirthYear: (birthYear) => setProfile((p) => ({ ...p, birthYear })),
      setJob: (job) => setProfile((p) => ({ ...p, job })),
    }),
    [profile],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
