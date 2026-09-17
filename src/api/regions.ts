export type RegionSource = 'user' | 'ai';

export type RegionCandidate = {
  name: string;
  reasons: string[];
  reasonsDetail?: { title: string; description: string }[];
  matchedPurposes?: number;
  totalPurposes?: number;
  candidateCount?: number;
  source: RegionSource;
  lDongRegnCd: string;
  lDongSignguCd: string;
  imageUrl: string | null;
  travelFromOrigin?: {
    mode: string;
    durationMinutes: number;
    summary: string;
  } | null;
};

export type RegionsResponse = {
  regions: RegionCandidate[];
};

export type RegionsRequest = {
  purposes: string[];
  destinations?: string[];
  excludeRegions?: string[];
  originMapx?: number;
  originMapy?: number;
  limit?: number;
};

const BASE_URL = 'https://optrip-server.fly.dev';

export async function recommendRegions(request: RegionsRequest): Promise<RegionsResponse> {
  const response = await fetch(`${BASE_URL}/api/recommend/regions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error(`지역 추천 요청 실패 (${response.status})`);
  return (await response.json()) as RegionsResponse;
}
