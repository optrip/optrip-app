import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { BUILT_AT, GIT_BRANCH, GIT_SHA } from '../lib/version';

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
  const scale = Math.min((width - margin * 2) / totalW, (height - margin * 2) / totalH, 1);

  // 웹 PC 미리보기 전용: 로컬스토리지 초기화 후 새로고침 (온보딩 등 영속 데이터 리셋)
  const resetStorage = () => {
    try {
      window.localStorage.clear();
    } catch {
      // 무시
    }
    window.location.reload();
  };

  // 캐시 무효화 강제 새로고침: Cache Storage / 서비스워커 제거 후 캐시버스터 쿼리로 재진입.
  // (배포 후 최신 번들이 안 잡히는 문제 대응)
  const hardReload = async () => {
    try {
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {
      // 무시
    }
    const url = new URL(window.location.href);
    url.searchParams.set('_', Date.now().toString());
    window.location.replace(url.toString());
  };

  const builtTime = BUILT_AT.slice(0, 16).replace('T', ' ');

  return (
    <View style={page}>
      <View style={devBar}>
        <Text style={versionText}>
          {GIT_BRANCH}@{GIT_SHA} · {builtTime}
        </Text>
        <View style={devButtons}>
          <Pressable style={devButton} onPress={hardReload}>
            <Text style={devButtonText}>강제 새로고침</Text>
          </Pressable>
          <Pressable style={devButton} onPress={resetStorage}>
            <Text style={devButtonText}>로컬스토리지 초기화</Text>
          </Pressable>
        </View>
      </View>

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

const devBar: ViewStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  alignItems: 'flex-end',
  gap: 8,
};

const versionText: TextStyle = {
  fontSize: 12,
  color: '#9a9a9a',
  fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
};

const devButtons: ViewStyle = {
  flexDirection: 'row',
  gap: 8,
};

const devButton: ViewStyle = {
  backgroundColor: '#ffffff',
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
};

const devButtonText: TextStyle = {
  fontSize: 13,
  fontWeight: '600',
  color: '#1f1f1f',
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
