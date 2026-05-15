import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRecommend } from '../../api/useRecommend';
import type { RecommendRequest } from '../../api/recommend';
import { COMPANION_LABEL, PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning, type DateRange } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Loading'>;

const LOGO = require('../../../assets/logo/optrip-large.png');

const MIN_DISPLAY_MS = 2500;

function durationText(noSpecific: boolean, range: DateRange) {
  if (noSpecific || !range.start) return '';
  if (!range.end || range.end === range.start) return '당일치기';
  const s = new Date(range.start);
  const e = new Date(range.end);
  const nights = Math.round((e.getTime() - s.getTime()) / 86400000);
  return `${nights}박 ${nights + 1}일`;
}

export function LoadingScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setResult, setError } = usePlanning();
  const recommend = useRecommend();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const body: RecommendRequest = {
      budget: '',
      duration: durationText(plan.noSpecificDate, plan.dateRange),
      startDate: plan.dateRange.start ?? '',
      endDate: plan.dateRange.end ?? plan.dateRange.start ?? '',
      companion: plan.companion ? COMPANION_LABEL[plan.companion] : '',
      purpose: plan.preferences.map((p) => PREFERENCE_LABEL[p]),
    };

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
