import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChevronBackButton } from '../../components/ChevronBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SkipLink } from '../../components/SkipLink';
import { usePlanning } from '../../lib/planningStore';
import { colors, spacing } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

import { Calendar } from './Calendar';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Schedule'>;

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setDateRange, setNoSpecificDate } = usePlanning();

  const hasRange = !!plan.dateRange.start || plan.noSpecificDate;
  const next = () => navigation.navigate('Companion');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChevronBackButton />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>언제 떠나나요?</Text>

        <View style={styles.calendarWrap}>
          <Calendar value={plan.dateRange} onChange={(range) => setDateRange(range)} />
        </View>

        <View style={styles.bottom}>
          <SecondaryButton
            label="구체적인 일정이 없어요"
            onPress={() => {
              setNoSpecificDate(true);
              next();
            }}
          />
          <PrimaryButton label="다음" onPress={next} disabled={!hasRange} />
          <SkipLink onPress={next} />
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
    marginBottom: spacing.lg,
  },
  calendarWrap: {
    marginBottom: spacing.lg,
  },
  bottom: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
