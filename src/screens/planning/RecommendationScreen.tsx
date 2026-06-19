import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useRecommendRegion, useRecommendCourses } from '../../api/useRecommend';
import { useOnboarding } from '../../lib/onboardingStore';
import { COMPANION_LABEL, PREFERENCE_LABEL } from '../../lib/labels';
import { buildRecommendRequest } from '../../lib/buildRequest';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Recommendation'>;

const HERO_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
};

function formatRange(start: string | null, end: string | null) {
  if (!start) return null;
  const fmt = (s: string) => {
    const [, m, d] = s.split('-');
    return `${Number(m)}월 ${Number(d)}일`;
  };
  if (!end || end === start) return fmt(start);
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function RecommendationScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useOnboarding();
  const { plan, setResult, setCourses, setError, pushExcludedRegion } = usePlanning();

  const regionMut = useRecommendRegion();
  const coursesMut = useRecommendCourses();
  const busy = regionMut.isPending || coursesMut.isPending;

  const summary = [
    plan.noSpecificDate ? '일정 미정' : formatRange(plan.dateRange.start, plan.dateRange.end),
    plan.companion ? COMPANION_LABEL[plan.companion] : null,
    plan.budget,
    plan.preferences.length > 0 ? PREFERENCE_LABEL[plan.preferences[0]] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const displayName = profile.name || 'ㅇㅇ';
  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  // 다른 지역으로 다시 추천받기
  const reroll = () => {
    const current = plan.result?.regionName;
    const body = buildRecommendRequest(plan);
    if (current) body.excludeRegions = [...(body.excludeRegions ?? []), current];
    regionMut.mutate(body, {
      onSuccess: (data) => {
        if (current) pushExcludedRegion(current);
        setResult(data);
      },
      onError: (err) => setError(err.message || '추천 요청에 실패했어요'),
    });
  };

  // 선택한 지역의 코스들을 한 번에 생성 -> 코스 선택 화면으로
  const showCourses = () => {
    if (!plan.result) return;
    const body = buildRecommendRequest(plan);
    body.regionName = plan.result.regionName;
    coursesMut.mutate(body, {
      onSuccess: (data) => {
        setCourses(data);
        navigation.navigate('CourseList');
      },
      onError: (err) => setError(err.message || '코스를 불러오지 못했어요'),
    });
  };

  if (plan.error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.errorWrap}>
          <View style={styles.errorMark}>
            <View style={styles.crossA} />
            <View style={styles.crossB} />
          </View>
          <Text style={styles.errorTitle}>여기가 잘못됐어요</Text>
          <Text style={styles.errorSubtitle}>잠시 후에 다시 시도해주세요</Text>
          <Pressable onPress={goHome} style={styles.homeBtn} hitSlop={12}>
            <Text style={styles.homeText}>홈으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan.result) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorSubtitle}>추천 결과가 없어요</Text>
          <Pressable onPress={goHome} style={styles.homeBtn} hitSlop={12}>
            <Text style={styles.homeText}>홈으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { regionName } = plan.result;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.textStrong} />
        </Pressable>
        <Pressable onPress={goHome} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="home-outline" size={24} color={colors.textStrong} />
        </Pressable>
      </View>

      <View style={styles.mainGroup}>
        <View style={styles.header}>
          <Text style={styles.title}>{displayName}님을 위한 추천 여행지</Text>
          {!!summary && <Text style={styles.summary}>{summary}</Text>}
        </View>

        <View style={styles.cardArea}>
          <View style={styles.card}>
            <ImageBackground
              source={HERO_IMAGE}
              style={styles.cardBg}
              imageStyle={styles.cardBgImage}
            >
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{regionName}</Text>
                <Pressable onPress={showCourses} style={styles.detailChip} disabled={busy}>
                  <Text style={styles.detailText}>추천 코스 보기</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textStrong} />
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={reroll} style={styles.rerollBtn} disabled={busy} hitSlop={8}>
          <Ionicons name="refresh" size={18} color={colors.textStrong} />
          <Text style={styles.rerollText}>여행지 추천 다시 받기</Text>
        </Pressable>
      </View>

      {busy && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.actionPrimary} />
          <Text style={styles.loadingText}>
            {coursesMut.isPending ? '추천 코스를 짜고 있어요' : '다른 여행지를 찾고 있어요'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const CARD_RADIUS = 28;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textStrong,
    textAlign: 'center',
  },
  summary: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  card: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBgImage: {
    borderRadius: CARD_RADIUS,
    opacity: 0.55,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  cardName: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textStrong,
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowRadius: 12,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardSelected,
    borderRadius: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textStrong,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  rerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.actionSecondary,
    borderRadius: 50,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
  },
  rerollText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textStrong,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  errorMark: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  crossA: {
    position: 'absolute',
    width: 70,
    height: 4,
    backgroundColor: '#E54848',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  crossB: {
    position: 'absolute',
    width: 70,
    height: 4,
    backgroundColor: '#E54848',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 2,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textStrong,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  homeBtn: {
    paddingVertical: spacing.sm,
  },
  homeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
