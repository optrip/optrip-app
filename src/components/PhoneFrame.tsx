import type { ReactNode } from 'react';
import { Platform, View, useWindowDimensions, type ViewStyle } from 'react-native';

const PHONE_WIDTH = 402;
const PHONE_HEIGHT = 874;
const BEZEL = 12;
const RADIUS = 56;

const ISLAND_WIDTH = 120;
const ISLAND_HEIGHT = 32;
const ISLAND_TOP = 14;
const SCREEN_TOP_PADDING = 56;

const MOBILE_BREAKPOINT = 600;

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < MOBILE_BREAKPOINT) {
    return <>{children}</>;
  }

  const margin = 24;
  const totalW = PHONE_WIDTH + BEZEL * 2;
  const totalH = PHONE_HEIGHT + BEZEL * 2;
  const scale = Math.min(
    (width - margin * 2) / totalW,
    (height - margin * 2) / totalH,
    1,
  );

  return (
    <View style={page}>
      <View style={[bezel, { transform: [{ scale }] }]}>
        <View style={screen}>
          <View style={contentArea}>{children}</View>
          <View style={island} pointerEvents="none" />
        </View>
      </View>
    </View>
  );
}

const page: ViewStyle = {
  flex: 1,
  backgroundColor: '#1f1f1f',
  alignItems: 'center',
  justifyContent: 'center',
  // @ts-expect-error web-only css unit
  minHeight: '100vh',
};

const bezel: ViewStyle = {
  width: PHONE_WIDTH + BEZEL * 2,
  height: PHONE_HEIGHT + BEZEL * 2,
  backgroundColor: '#000',
  borderRadius: RADIUS,
  padding: BEZEL,
  shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 12 },
};

const screen: ViewStyle = {
  width: PHONE_WIDTH,
  height: PHONE_HEIGHT,
  borderRadius: RADIUS - BEZEL,
  overflow: 'hidden',
  backgroundColor: '#fff',
  position: 'relative',
};

const contentArea: ViewStyle = {
  flex: 1,
  paddingTop: SCREEN_TOP_PADDING,
};

const island: ViewStyle = {
  position: 'absolute',
  top: ISLAND_TOP,
  left: (PHONE_WIDTH - ISLAND_WIDTH) / 2,
  width: ISLAND_WIDTH,
  height: ISLAND_HEIGHT,
  borderRadius: ISLAND_HEIGHT / 2,
  backgroundColor: '#000',
};
