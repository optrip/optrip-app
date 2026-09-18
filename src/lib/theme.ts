export const colors = {
  background: '#F9F8F4',
  textPrimary: '#1A1A1A',
  textStrong: '#111111',
  textSecondary: '#666666',
  cardSelected: '#D1D7C4',
  cardDefault: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.03)',
  divider: '#E5E3D7',
  
  // 버튼 및 주요 인터랙션 색상
  actionPrimary: '#23382B',         
  actionPrimaryDisabled: '#E5E3D7',
  actionSecondary: '#E8E8DA',
  
  skipText: '#888888',
  progressTrack: '#E5E3D7',
  progressFill: '#23382B',
  rangeEnd: '#23382B',
  rangeMid: '#D1D7C4',
} as const;

export const typography = {
  heading: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  back: { fontSize: 20, fontWeight: '300' as const, color: colors.textSecondary },
  inputPlaceholder: { fontSize: 16, fontWeight: '400' as const, color: '#C4C4C4' },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  screenPaddingX: 24,
} as const;

export const radius = {
  card: 20,
} as const;

export const layout = {
  cardLong: { width: 160, height: 200 },
  cardSquare: { aspectRatio: 1 },
  cardGap: 12,
} as const;