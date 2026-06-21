// 이동수단: 자동차 | 대중교통
export type Transport = 'car' | 'public';

export type RecommendRequest = {
  budget: string;
  duration: string;
  startDate: string;
  endDate: string;
  companion: string;
  purpose: string[]; // 추구미 라벨, 최소 1개, 최대 5개 (카테고리 묶음은 서버에서 처리)
  transport: string; // "자동차" | "대중교통"
  excludeRegions?: string[]; // 지역 다시 받기 시 제외할 지역명
  regionName?: string; // 코스 생성 시 선택한 지역명
};

// /region 응답 (Image #1)
export type RegionResponse = {
  regionName: string;
  description: string;
  reason: string;
  tags: string[];
};

// 방문지 사이 이동 정보
export type TransportLeg = {
  mode: string; // "도보" | "지하철" | "버스" | "자동차" | "택시" 등
  durationMinutes: number;
  note: string; // "1회 환승" 등, 없으면 빈 문자열
};

export type Visit = {
  order: number;
  name: string;
  description: string;
  latitude: number; // Kakao Map 마킹용
  longitude: number; // Kakao Map 마킹용
  transportToNext: TransportLeg | null; // 일차 마지막 방문지는 null
};

export type DayPlan = {
  day: number;
  visits: Visit[];
};

export type Course = {
  purpose: string; // 카테고리 라벨 (예: "자연·휴식"). 서버가 추구미를 묶어 결정
  title: string;
  summary: string;
  days: DayPlan[];
};

// /courses 응답 (Image #2, #3)
export type CourseListResponse = {
  regionName: string;
  courses: Course[];
};

const BASE_URL = 'https://optrip-server.fly.dev';

async function postJson<T>(path: string, body: RecommendRequest): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function recommendRegion(body: RecommendRequest): Promise<RegionResponse> {
  return postJson<RegionResponse>('/api/recommend/region', body);
}

export function recommendCourses(body: RecommendRequest): Promise<CourseListResponse> {
  return postJson<CourseListResponse>('/api/recommend/courses', body);
}
