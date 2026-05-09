import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackLink } from '../../components/BackLink';
import { useOnboarding } from '../../lib/onboardingStore';
import { colors, layout, radius, spacing } from '../../lib/theme';
import type { Gender, OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GenderSelect'>;

const OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
];

export function GenderSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setGender } = useOnboarding();

  const select = (g: Gender) => {
    setGender(g);
    navigation.navigate('BirthYear');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackLink />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>성별을 선택해 주세요</Text>

        <View style={styles.row}>
          {OPTIONS.map(({ value, label }) => {
            const selected = profile.gender === value;
            return (
              <Pressable
                key={value}
                onPress={() => select(value)}
                style={[styles.card, selected && styles.cardSelected]}
              >
                <Text style={styles.cardText}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: layout.cardGap,
  },
  card: {
    width: layout.cardLong.width,
    height: layout.cardLong.height,
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
    fontSize: 28,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
