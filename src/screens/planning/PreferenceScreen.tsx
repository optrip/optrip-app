import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChevronBackButton } from '../../components/ChevronBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePlanning } from '../../lib/planningStore';
import { colors, radius, spacing } from '../../lib/theme';
import type { OnboardingStackParamList, Preference } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Preference'>;

// 화면 표기는 줄바꿈이 자연스럽도록 공백을 둔 라벨을 쓰고,
// 서버 전송 값은 buildRequest 에서 PREFERENCE_LABEL(정규 라벨)로 변환한다.
// 카테고리는 화면에 노출하지 않는 평면 그리드. 3×4 순서로 나열.
const OPTIONS: { value: Preference; label: string }[] = [
  { value: 'healing', label: '힐링' },
  { value: 'nature', label: '자연 / 풍경' },
  { value: 'sea', label: '바다' },
  { value: 'food', label: '맛집' },
  { value: 'cafe', label: '카페 투어' },
  { value: 'market', label: '시장 / 먹거리' },
  { value: 'history', label: '역사 · 문화' },
  { value: 'culture', label: '문화 체험' },
  { value: 'activity', label: '액티비티' },
  { value: 'hiking', label: '하이킹 / 트레킹' },
  { value: 'photo', label: '감성 / 사진' },
  { value: 'nightview', label: '야경' },
];

const MAX_SELECT = 5;

const GAP = 14;

export function PreferenceScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, togglePreference } = usePlanning();
  const [cardSize, setCardSize] = useState<number | null>(null);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const next = Math.floor((w - GAP * 2) / 3);
    if (next !== cardSize) setCardSize(next);
  };

  const next = () => navigation.navigate('Transport');
  const enabled = plan.preferences.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChevronBackButton />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>어떤 여행을 원하나요?</Text>
        <Text style={styles.subtitle}>{MAX_SELECT}개까지 선택</Text>

        <View style={styles.grid} onLayout={onGridLayout}>
          {cardSize !== null &&
            OPTIONS.map((opt) => {
              const selected = plan.preferences.includes(opt.value);
              const atMax = plan.preferences.length >= MAX_SELECT;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => togglePreference(opt.value)}
                  disabled={!selected && atMax}
                  style={[
                    styles.card,
                    { width: cardSize, height: cardSize },
                    selected && styles.cardSelected,
                  ]}
                >
                  <Text style={[styles.cardText, selected && styles.cardTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="다음" onPress={next} disabled={!enabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.sm,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: GAP,
    rowGap: GAP,
  },
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.cardDefault,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: colors.cardSelected,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardTextSelected: {
    color: '#FFFFFF',
  },
  bottom: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
});
