import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CourseListResponse, RegionResponse } from '../api/recommend';
import type { PlaceRecommendationsResponse } from '../api/places';
import type { RegionCandidate } from '../api/regions';
import type { InterpretResult } from '../api/interpret';
import type { Companion, Preference, TransportMode } from '../navigation/types';
import { getPlanningDays, reconcilePlaceDays } from './placeSchedule';

export type DateRange = {
  start: string | null;
  end: string | null;
};

export type PlanningState = {
  budget: string | null;
  dateRange: DateRange;
  noSpecificDate: boolean;
  companion: Companion | null;
  preferences: Preference[];
  transport: TransportMode | null;
  interpretation: InterpretResult | null;
  result: RegionResponse | null; // 현재 추천된 지역 (Image #1)
  selectedRegion: RegionCandidate | null;
  placeRecommendations: PlaceRecommendationsResponse | null;
  selectedPlaceIds: string[];
  selectedPlaceDays: string[][];
  courses: CourseListResponse | null; // 선택 지역의 코스들 (Image #2, #3)
  excludeRegions: string[]; // 다시 받기 시 제외할, 이미 본 지역명
  error: string | null;
};

type PlanningContextValue = {
  plan: PlanningState;
  setBudget: (v: string | null) => void;
  setDateRange: (range: DateRange) => void;
  setNoSpecificDate: (v: boolean) => void;
  setCompanion: (c: Companion) => void;
  togglePreference: (p: Preference) => void;
  setPreferences: (preferences: Preference[]) => void;
  setTransport: (t: TransportMode) => void;
  setInterpretation: (result: InterpretResult | null) => void;
  setResult: (r: RegionResponse | null) => void;
  setSelectedRegion: (region: RegionCandidate | null) => void;
  setPlaceRecommendations: (places: PlaceRecommendationsResponse | null) => void;
  setSelectedPlaceIds: (contentIds: string[]) => void;
  setSelectedPlaceDays: (days: string[][]) => void;
  setCourses: (c: CourseListResponse | null) => void;
  pushExcludedRegion: (name: string) => void;
  setError: (e: string | null) => void;
  reset: () => void;
};

const initial: PlanningState = {
  budget: null,
  dateRange: { start: null, end: null },
  noSpecificDate: false,
  companion: null,
  preferences: [],
  transport: null,
  interpretation: null,
  result: null,
  selectedRegion: null,
  placeRecommendations: null,
  selectedPlaceIds: [],
  selectedPlaceDays: [],
  courses: null,
  excludeRegions: [],
  error: null,
};

const PlanningContext = createContext<PlanningContextValue | null>(null);

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanningState>(initial);

  const value = useMemo<PlanningContextValue>(
    () => ({
      plan,
      setBudget: (budget) => setPlan((p) => ({ ...p, budget })),
      setDateRange: (dateRange) => setPlan((p) => ({ ...p, dateRange, noSpecificDate: false })),
      setNoSpecificDate: (noSpecificDate) =>
        setPlan((p) => ({
          ...p,
          noSpecificDate,
          dateRange: noSpecificDate ? { start: null, end: null } : p.dateRange,
        })),
      setCompanion: (companion) => setPlan((p) => ({ ...p, companion })),
      togglePreference: (pref) =>
        setPlan((p) => {
          if (p.preferences.includes(pref)) {
            return { ...p, preferences: p.preferences.filter((x) => x !== pref) };
          }
          // 최대 5개까지만 선택 가능 (선택 순서는 동점 시 카테고리 우선순위 기준이 됨)
          if (p.preferences.length >= 5) return p;
          return { ...p, preferences: [...p.preferences, pref] };
        }),
      setPreferences: (preferences) => setPlan((p) => ({ ...p, preferences })),
      setTransport: (transport) => setPlan((p) => ({ ...p, transport })),
      setInterpretation: (interpretation) => setPlan((p) => ({ ...p, interpretation })),
      // 새 지역을 받으면 이전에 보던 코스는 무효화
      setResult: (result) => setPlan((p) => ({ ...p, result, courses: null, error: null })),
      setSelectedRegion: (selectedRegion) =>
        setPlan((p) => ({
          ...p,
          selectedRegion,
          placeRecommendations: null,
          selectedPlaceIds: [],
          selectedPlaceDays: [],
        })),
      setPlaceRecommendations: (placeRecommendations) =>
        setPlan((p) => ({
          ...p,
          placeRecommendations,
          selectedPlaceIds: [],
          selectedPlaceDays: [],
        })),
      setSelectedPlaceIds: (selectedPlaceIds) =>
        setPlan((p) => ({
          ...p,
          selectedPlaceIds: [...new Set(selectedPlaceIds)],
          selectedPlaceDays: reconcilePlaceDays(
            selectedPlaceIds,
            getPlanningDays(p.dateRange, p.noSpecificDate),
            p.selectedPlaceDays,
          ),
        })),
      setSelectedPlaceDays: (selectedPlaceDays) =>
        setPlan((p) => ({
          ...p,
          selectedPlaceDays,
          selectedPlaceIds: selectedPlaceDays.flat(),
        })),
      setCourses: (courses) => setPlan((p) => ({ ...p, courses })),
      pushExcludedRegion: (name) =>
        setPlan((p) =>
          p.excludeRegions.includes(name)
            ? p
            : { ...p, excludeRegions: [...p.excludeRegions, name] },
        ),
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
