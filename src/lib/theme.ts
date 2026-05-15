export const colors = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textStrong: '#111111',
  textSecondary: '#767676',
  cardSelected: '#A4BDED',
  cardDefault: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  divider: '#000000',
  actionPrimary: '#0088FF',
  actionSecondary: '#EEEEEE',
  progressTrack: '#EEEEEE',
  progressFill: '#007AFF',
  rangeEnd: '#0088FF',
  rangeMid: '#D4E8FF',
} as const;

export const typography = {
  heading: { fontSize: 28, fontWeight: '500' as const, lineHeight: 34 },
  body: { fontSize: 28, fontWeight: '400' as const, lineHeight: 34 },
  back: { fontSize: 20, fontWeight: '300' as const, color: colors.textSecondary },
  inputPlaceholder: { fontSize: 28, fontWeight: '400' as const, color: '#B0B0B0' },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPaddingX: 32,
} as const;

export const radius = {
  card: 30,
} as const;

export const layout = {
  cardLong: { width: 160, height: 200 },
  cardSquare: { aspectRatio: 1 },
  cardGap: 19,
} as const;
