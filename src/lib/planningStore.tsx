import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { RecommendResponse } from '../api/recommend';
import type { Companion, Preference } from '../navigation/types';

export type DateRange = {
  start: string | null;
  end: string | null;
};

export type PlanningState = {
  dateRange: DateRange;
  noSpecificDate: boolean;
  companion: Companion | null;
  preferences: Preference[];
  result: RecommendResponse | null;
  error: string | null;
};

type PlanningContextValue = {
  plan: PlanningState;
  setDateRange: (range: DateRange) => void;
  setNoSpecificDate: (v: boolean) => void;
  setCompanion: (c: Companion) => void;
  togglePreference: (p: Preference) => void;
  setResult: (r: RecommendResponse | null) => void;
  setError: (e: string | null) => void;
  reset: () => void;
};

const initial: PlanningState = {
  dateRange: { start: null, end: null },
  noSpecificDate: false,
  companion: null,
  preferences: [],
  result: null,
  error: null,
};

const PlanningContext = createContext<PlanningContextValue | null>(null);

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanningState>(initial);

  const value = useMemo<PlanningContextValue>(
    () => ({
      plan,
      setDateRange: (dateRange) => setPlan((p) => ({ ...p, dateRange, noSpecificDate: false })),
      setNoSpecificDate: (noSpecificDate) =>
        setPlan((p) => ({
          ...p,
          noSpecificDate,
          dateRange: noSpecificDate ? { start: null, end: null } : p.dateRange,
        })),
      setCompanion: (companion) => setPlan((p) => ({ ...p, companion })),
      togglePreference: (pref) =>
        setPlan((p) => ({
          ...p,
          preferences: p.preferences.includes(pref)
            ? p.preferences.filter((x) => x !== pref)
            : [...p.preferences, pref],
        })),
      setResult: (result) => setPlan((p) => ({ ...p, result, error: null })),
      setError: (error) => setPlan((p) => ({ ...p, error, result: null })),
      reset: () => setPlan(initial),
    }),
    [plan],
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanning must be used inside PlanningProvider');
  return ctx;
}
