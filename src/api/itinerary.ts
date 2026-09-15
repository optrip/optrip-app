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
