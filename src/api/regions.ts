export type RegionSource = 'user' | 'ai';

export type RegionCandidate = {
  name: string;
  reasons: string[];
  source: RegionSource;
  lDongRegnCd: string;
  lDongSignguCd: string;
  imageUrl: string | null;
};

export type RegionsResponse = {
  regions: RegionCandidate[];
};

export const MOCK_REGIONS_RESPONSE: RegionsResponse = {
  regions: [
    {
      name: '경주',
      reasons: ['아름다운 단풍', '다양한 고대 유물들'],
      source: 'user',
      lDongRegnCd: '47',
      lDongSignguCd: '130',
      imageUrl: 'https://tong.visitkorea.or.kr/cms/resource/71/4056771_image2_1.jpg',
    },
    {
      name: '동해',
      reasons: ['푸른 동해 바다', '싱싱한 회'],
      source: 'ai',
      lDongRegnCd: '51',
      lDongSignguCd: '170',
      imageUrl: 'https://tong.visitkorea.or.kr/cms/resource/64/3070464_image2_1.jpg',
    },
    {
      name: '속초',
      reasons: ['풍부한 놀거리', '오죽헌', '짬뽕'],
      source: 'ai',
      lDongRegnCd: '51',
      lDongSignguCd: '210',
      imageUrl: 'https://tong.visitkorea.or.kr/cms/resource/95/3394195_image2_1.JPG',
    },
  ],
};

export function getMockRegionRecommendations(): Promise<RegionsResponse> {
  return Promise.resolve(MOCK_REGIONS_RESPONSE);
}
