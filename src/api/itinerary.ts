export type ItineraryPlace = {
  contentId: string;
  title: string;
  addr1: string;
  mapx: number;
  mapy: number;
  imageUrl: string | null;
};

export type ItineraryLeg = {
  mode: string;
  summary: string;
  durationMinutes: number;
  distanceMeters: number;
  encodedPolyline?: string;
};

export type ItineraryItem = {
  place: ItineraryPlace;
  legToNext?: ItineraryLeg;
};

export type ItineraryDay = { day: number; items: ItineraryItem[] };
export type ItineraryResponse = { transport: string; days: ItineraryDay[] };
export type ItineraryRequest = {
  placeIds: string[];
  transport: '대중교통' | '자동차';
  days: number;
  optimizeOrder?: boolean;
};

const BASE_URL = 'https://optrip-server.fly.dev';

export async function createItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
  if (request.placeIds.length === 0) throw new Error('선택한 장소가 없어요.');
  const response = await fetch(`${BASE_URL}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`일정 생성 요청 실패 (${response.status})`);
  return (await response.json()) as ItineraryResponse;
}

// 날짜를 자동으로 다시 나누지 않고 사용자가 정한 날짜·순서를 유지합니다.
export async function createScheduledItinerary(
  placeDays: string[][],
  transport: ItineraryRequest['transport'],
): Promise<ItineraryResponse> {
  if (!placeDays.some((ids) => ids.length)) throw new Error('선택한 장소가 없어요.');
  if (placeDays.some((ids) => ids.length > 5))
    throw new Error('DAY별 최대 5곳까지 담을 수 있어요.');
  const days = await Promise.all(
    placeDays.map(async (placeIds, index) => {
      if (!placeIds.length) return { day: index + 1, items: [] };
      const response = await createItinerary({
        placeIds,
        transport,
        days: 1,
        optimizeOrder: false,
      });
      return { day: index + 1, items: response.days[0]?.items ?? [] };
    }),
  );
  return { transport, days };
}
