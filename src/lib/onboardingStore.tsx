import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Gender, Job } from '../navigation/types';
import { loadJSON, removeKey, saveJSON } from './storage';

export type SavedTrip = { id: string; title: string; desc: string; image: string };
export type OnboardingProfile = { name: string; gender: Gender | null; birthYear: string; job: Job | null; };

type PersistedOnboarding = {
  profile: OnboardingProfile;
  onboarded: boolean;
  savedTrips: SavedTrip[];
};

type OnboardingContextValue = {
  profile: OnboardingProfile;
  onboarded: boolean;
  hydrated: boolean;
  savedTrips: SavedTrip[];
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setBirthYear: (v: string) => void;
  setJob: (v: Job) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  saveTrip: (trip: Omit<SavedTrip, 'id'>) => void;
};

const STORAGE_KEY = 'optrip.onboarding';
const initial: OnboardingProfile = { name: '', gender: null, birthYear: '', job: null };
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initial);
  const [onboarded, setOnboarded] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadJSON<PersistedOnboarding>(STORAGE_KEY).then((stored) => {
      if (stored) {
        setProfile({ ...initial, ...stored.profile });
        setOnboarded(!!stored.onboarded);
        setSavedTrips(stored.savedTrips || []);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJSON<PersistedOnboarding>(STORAGE_KEY, { profile, onboarded, savedTrips });
  }, [profile, onboarded, savedTrips, hydrated]);

  const value = useMemo<OnboardingContextValue>(() => ({
    profile, onboarded, hydrated, savedTrips,
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
      removeKey(STORAGE_KEY);
    },
  }), [profile, onboarded, hydrated, savedTrips]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}