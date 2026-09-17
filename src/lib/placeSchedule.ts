import type { DateRange } from './planningStore';

export const MAX_PLACES_PER_DAY = 5;

export function getPlanningDays(range: DateRange, noSpecificDate: boolean) {
  if (noSpecificDate || !range.start) return 1;
  const start = Date.parse(`${range.start}T00:00:00Z`);
  const end = Date.parse(`${range.end ?? range.start}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

// 이미 고른 날짜와 순서는 보존하고, 새로 담은 장소만 빈 날짜에 넣습니다.
export function reconcilePlaceDays(ids: string[], dayCount: number, previous: string[][] = []) {
  const wanted = new Set(ids);
  const assigned = new Set<string>();
  const days = Array.from({ length: dayCount }, (_, day) =>
    (previous[day] ?? []).filter((id) => {
      if (!wanted.has(id) || assigned.has(id)) return false;
      assigned.add(id);
      return true;
    }),
  );
  for (const id of wanted) {
    if (assigned.has(id)) continue;
    const target = days.reduce(
      (best, list, index) => (list.length < days[best].length ? index : best),
      0,
    );
    days[target].push(id);
  }
  return days;
}

export function moveScheduledPlace(
  days: string[][],
  id: string,
  targetDay: number,
  targetIndex: number,
) {
  const sourceDay = days.findIndex((list) => list.includes(id));
  if (sourceDay < 0 || !days[targetDay]) return days;
  if (sourceDay !== targetDay && days[targetDay].length >= MAX_PLACES_PER_DAY) return days;
  const sourceIndex = days[sourceDay].indexOf(id);
  const next = days.map((list) => list.filter((item) => item !== id));
  const adjusted =
    sourceDay === targetDay && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  next[targetDay].splice(Math.max(0, Math.min(adjusted, next[targetDay].length)), 0, id);
  return next;
}
