import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRecommendRegion } from '../../api/useRecommend';
import { buildRecommendRequest } from '../../lib/buildRequest';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Loading'>;

const LOGO = require('../../../assets/logo/optrip-large.png');

// 실제 추천 응답이 약 11~15초 걸려, progress bar 가 10초에 걸쳐 차도록 설정.
const MIN_DISPLAY_MS = 10000;

export function LoadingScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setResult, setError } = usePlanning();
  const recommend = useRecommendRegion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const body = buildRecommendRequest(plan);
    const startedAt = Date.now();

    Animated.timing(progress, {
      toValue: 1,
      duration: MIN_DISPLAY_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    let cancelled = false;

    recommend.mutate(body, {
      onSuccess: (data) => {
        if (cancelled) return;
        setResult(data);
        finish();
      },
      onError: (err) => {
        if (cancelled) return;
        setError(err.message || '추천 요청에 실패했어요');
        finish();
      },
    });

    function finish() {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) navigation.replace('Recommendation');
      }, remaining);
    }

    return () => {
      cancelled = true;
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* 안내 타이틀 */}
      <Text style={styles.title}>잠시만 기다려주세요</Text>

      {/* 심볼 로고 */}
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />

      {/* 프로그레스 바 트랙 & 애니메이션 바 */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F9F8F4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX || 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary || '#1A1A1A',
    marginBottom: 16,
  },
  logo: {
    width: 200,
    height: 72,
    marginBottom: 36,
  },
  track: {
    width: 260,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E3D7',
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    backgroundColor: '#8F9A68',
    borderRadius: 2,
  },
});

export default LoadingScreen;