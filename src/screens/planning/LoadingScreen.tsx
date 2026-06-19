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
// (응답이 더 걸리면 바가 가득 찬 상태로 완료까지 대기)
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
      <Text style={styles.title}>맞춤 여행지를 찾고 있어요</Text>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingX,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 220,
    height: 84,
    marginBottom: spacing.xl,
  },
  track: {
    width: 240,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: colors.progressFill,
    borderRadius: 2,
  },
});
