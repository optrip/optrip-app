export type PlaceSummary = {
  contentId: string;
  title: string;
  addr1: string;
  mapx: number;
  mapy: number;
  imageUrl: string;
  purpose: string;
  reason: string;
};

export type PlaceRecommendationsResponse = {
  core: PlaceSummary[];
  suggestions: PlaceSummary[];
};

export type PlaceAccessibility = {
  elevator: string;
  status: string;
  wheelchair: string;
};

export type PlaceDetail = {
  contentId: string;
  title: string;
  addr1: string;
  mapx: number;
  mapy: number;
  imageUrl: string;
  overview: string;
  useTime: string;
  restDate: string;
  parking: string;
  fee: string;
  accessibility: PlaceAccessibility;
};

const BASE_URL = 'https://optrip-server.fly.dev';

export function getPlaceDisplayTitle(title: string, regionName: string | undefined) {
  const trimmedRegionName = regionName?.trim();
  const regionPrefix = trimmedRegionName ? `${trimmedRegionName} ` : '';

  return regionPrefix && title.startsWith(regionPrefix) ? title.slice(regionPrefix.length) : title;
}

export async function recommendPlaces(): Promise<PlaceRecommendationsResponse> {
  const response = await fetch(`${BASE_URL}/api/recommend/places`, {
    method: 'POST',
    headers: { Accept: '*/*' },
  });

  if (!response.ok) {
    throw new Error(`장소 추천 요청에 실패했어요: ${response.status}`);
  }

  return (await response.json()) as PlaceRecommendationsResponse;
}

export async function getPlaceDetail(contentId: string): Promise<PlaceDetail> {
  const response = await fetch(`${BASE_URL}/api/places/${contentId}/detail`, {
    headers: { Accept: '*/*' },
  });

  if (!response.ok) {
    throw new Error(`장소 상세 요청에 실패했어요: ${response.status}`);
  }

  return (await response.json()) as PlaceDetail;
}
