import type { PlaceSummary } from '../api/places';
import type { DateRange } from './planningStore';

export type CourseDay = {
  dayNumber: number;
  date: string | null;
  places: PlaceSummary[];
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function getDates(dateRange: DateRange, noSpecificDate: boolean) {
  if (noSpecificDate) return [null];

  const start = parseDate(dateRange.start);
  const end = parseDate(dateRange.end ?? dateRange.start);
  if (!start || !end || end < start) return [dateRange.start];

  const dayCount = Math.floor((end.getTime() - start.getTime()) / DAY_IN_MS) + 1;
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_IN_MS);
    return date.toISOString().slice(0, 10);
  });
}

function distanceBetween(a: PlaceSummary, b: PlaceSummary) {
  const latitudeDistance = a.mapy - b.mapy;
  const longitudeDistance = (a.mapx - b.mapx) * Math.cos(((a.mapy + b.mapy) * Math.PI) / 360);
  return latitudeDistance * latitudeDistance + longitudeDistance * longitudeDistance;
}

function distanceToDay(place: PlaceSummary, places: PlaceSummary[]) {
  if (places.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...places.map((candidate) => distanceBetween(place, candidate)));
}

function orderNearbyPlaces(places: PlaceSummary[], coreIds: Set<string>) {
  if (places.length < 2) return places;

  const remaining = [...places];
  const firstCoreIndex = remaining.findIndex((place) => coreIds.has(place.contentId));
  const [first] = remaining.splice(firstCoreIndex >= 0 ? firstCoreIndex : 0, 1);
  const ordered = [first];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIndex = 0;
    let nearestDistance = distanceBetween(current, remaining[0]);

    for (let index = 1; index < remaining.length; index += 1) {
      const distance = distanceBetween(current, remaining[index]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return ordered;
}

export function buildCourseSchedule(
  selectedPlaces: PlaceSummary[],
  corePlaces: PlaceSummary[],
  dateRange: DateRange,
  noSpecificDate: boolean,
): CourseDay[] {
  const dates = getDates(dateRange, noSpecificDate);
  const days = dates.map((date, index) => ({
    dayNumber: index + 1,
    date,
    places: [] as PlaceSummary[],
  }));
  if (selectedPlaces.length === 0) return days;

  const selectedIds = new Set(selectedPlaces.map((place) => place.contentId));
  const selectedCore = corePlaces.filter((place) => selectedIds.has(place.contentId));
  const coreIds = new Set(selectedCore.map((place) => place.contentId));
  const suggestions = selectedPlaces.filter((place) => !coreIds.has(place.contentId));

  selectedCore.forEach((place, index) => {
    days[index % days.length].places.push(place);
  });

  const emptyDays = days.filter((day) => day.places.length === 0);
  emptyDays.forEach((day) => {
    if (suggestions.length === 0) return;

    const assignedPlaces = days.flatMap((candidate) => candidate.places);
    let seedIndex = 0;
    let farthestDistance = -1;

    suggestions.forEach((place, index) => {
      const distance = assignedPlaces.length
        ? Math.min(...assignedPlaces.map((assigned) => distanceBetween(place, assigned)))
        : 0;
      if (distance > farthestDistance) {
        farthestDistance = distance;
        seedIndex = index;
      }
    });

    day.places.push(suggestions.splice(seedIndex, 1)[0]);
  });

  const targetSize = Math.ceil(selectedPlaces.length / days.length);
  suggestions.forEach((place) => {
    const availableDays = days.filter((day) => day.places.length < targetSize);
    const candidates = availableDays.length > 0 ? availableDays : days;
    const closestDay = candidates.reduce((best, day) =>
      distanceToDay(place, day.places) < distanceToDay(place, best.places) ? day : best,
    );
    closestDay.places.push(place);
  });

  return days.map((day) => ({
    ...day,
    places: orderNearbyPlaces(day.places, coreIds),
  }));
}
