import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChevronBackButton } from '../../components/ChevronBackButton';
import { SkipLink } from '../../components/SkipLink';
import { usePlanning } from '../../lib/planningStore';
import { colors, layout, radius, spacing } from '../../lib/theme';
import type { Companion, OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Companion'>;

const OPTIONS: { value: Companion; label: string }[] = [
  { value: 'alone', label: '혼자' },
  { value: 'friend', label: '친구와' },
  { value: 'partner', label: '애인과' },
  { value: 'parents', label: '부모님과' },
  { value: 'kid', label: '아이와' },
  { value: 'other', label: '기타' },
];

export function CompanionScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setCompanion } = usePlanning();
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const next = Math.floor((w - layout.cardGap) / 2);
    if (next !== cardWidth) setCardWidth(next);
  };

  const select = (c: Companion) => {
    setCompanion(c);
    navigation.navigate('Preference');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChevronBackButton />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>누구와 가나요?</Text>

        <View style={styles.grid} onLayout={onGridLayout}>
          {cardWidth !== null &&
            OPTIONS.map(({ value, label }) => {
              const selected = plan.companion === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => select(value)}
                  style={[
                    styles.card,
                    { width: cardWidth, height: cardWidth * 0.72 },
                    selected && styles.cardSelected,
                  ]}
                >
                  <Text style={styles.cardText}>{label}</Text>
                </Pressable>
              );
            })}
        </View>

        <View style={styles.bottom}>
          <SkipLink onPress={() => navigation.navigate('Preference')} />
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
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: layout.cardGap,
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
    fontSize: 24,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bottom: {
    marginTop: 'auto',
  },
});
