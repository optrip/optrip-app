import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackLink } from '../../components/BackLink';
import { useOnboarding } from '../../lib/onboardingStore';
import { colors, layout, radius, spacing } from '../../lib/theme';
import type { Job, OnboardingStackParamList } from '../../navigation/types';

const SCREEN_W = Dimensions.get('window').width;
const CARD_SIZE = Math.floor((SCREEN_W - spacing.screenPaddingX * 2 - layout.cardGap) / 2);

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'JobSelect'>;

const OPTIONS: { value: Job; label: string }[] = [
  { value: 'student', label: '학생' },
  { value: 'employee', label: '직장인' },
  { value: 'self', label: '자영업' },
  { value: 'homemaker', label: '주부' },
  { value: 'unemployed', label: '무직' },
  { value: 'other', label: '기타' },
];

export function JobSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setJob } = useOnboarding();

  const select = (j: Job) => {
    setJob(j);
    // 온보딩 끝 — 일단 다음 단계는 추후 메인 화면 연결.
    // 임시로 첫 화면으로 reset 또는 alert. 여기서는 reset.
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackLink />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>직업을 선택해주세요</Text>

        <View style={styles.grid}>
          {OPTIONS.map(({ value, label }) => {
            const selected = profile.job === value;
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
    width: CARD_SIZE,
    height: CARD_SIZE,
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
