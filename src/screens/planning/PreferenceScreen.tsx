import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChevronBackButton } from '../../components/ChevronBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePlanning } from '../../lib/planningStore';
import { colors, radius, spacing } from '../../lib/theme';
import type { OnboardingStackParamList, Preference } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Preference'>;

const OPTIONS: { value: Preference; label: string }[] = [
  { value: 'healing', label: '힐링' },
  { value: 'food', label: '맛집' },
  { value: 'mood', label: '감성/사진' },
  { value: 'nature', label: '자연/풍경' },
  { value: 'history', label: '역사/문화' },
  { value: 'activity', label: '액티비티' },
  { value: 'culture', label: '문화체험' },
  { value: 'cafe', label: '카페투어' },
];

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

      <View style={styles.body}>
        <Text style={styles.title}>어떤 여행을 원하나요?</Text>
        <Text style={styles.subtitle}>최소 1개, 최대 3개 선택</Text>

        <View style={styles.grid} onLayout={onGridLayout}>
          {cardSize !== null &&
            OPTIONS.map((opt) => {
              const selected = plan.preferences.includes(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => togglePreference(opt.value)}
                  style={[
                    styles.card,
                    { width: cardSize, height: cardSize },
                    selected && styles.cardSelected,
                  ]}
                >
                  <Text style={styles.cardText}>{opt.label}</Text>
                </Pressable>
              );
            })}
        </View>

        <View style={styles.bottom}>
          <PrimaryButton label="다음" onPress={next} disabled={!enabled} />
        </View>
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
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
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
  bottom: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
