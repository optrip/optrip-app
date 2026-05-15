export type RecommendRequest = {
  budget: string;
  duration: string;
  startDate: string;
  endDate: string;
  companion: string;
  purpose: string[];
};

export type RecommendResponse = {
  regionName: string;
  description: string;
  reason: string;
  tags: string[];
};

const BASE_URL = 'https://optrip-server.fly.dev';

export async function recommendWithAI(body: RecommendRequest): Promise<RecommendResponse> {
  const res = await fetch(`${BASE_URL}/api/recommend-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`recommend-ai failed: ${res.status}`);
  }
  return (await res.json()) as RecommendResponse;
}
