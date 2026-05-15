import { View, Text, Pressable, StyleSheet, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useOnboarding } from '../../lib/onboardingStore';
import { COMPANION_LABEL, PREFERENCE_LABEL } from '../../lib/labels';
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
  const { plan } = usePlanning();

  const summary = [
    plan.noSpecificDate ? '일정 미정' : formatRange(plan.dateRange.start, plan.dateRange.end),
    plan.companion ? COMPANION_LABEL[plan.companion] : null,
    plan.preferences.length > 0 ? PREFERENCE_LABEL[plan.preferences[0]] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const displayName = profile.name || 'ㅇㅇ';
  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

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

  const { regionName, description, reason } = plan.result;

  const showDetail = () => {
    const lines = [description, reason].filter(Boolean).join('\n\n');
    Alert.alert(regionName, lines || '상세 정보가 없어요');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
                <Pressable onPress={showDetail} style={styles.detailChip}>
                  <Text style={styles.detailText}>자세히 보기</Text>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={goHome} style={styles.homeBtn} hitSlop={12}>
          <Text style={styles.homeText}>홈으로</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 28;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  homeBtn: {
    paddingVertical: spacing.sm,
  },
  homeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
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
});
