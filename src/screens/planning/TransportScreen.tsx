import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ChevronBackButton } from '../../components/ChevronBackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePlanning } from '../../lib/planningStore';
import { colors, radius, spacing } from '../../lib/theme';
import type { OnboardingStackParamList, TransportMode } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Transport'>;

const OPTIONS: { value: TransportMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'car', label: '자동차', icon: 'car-outline' },
  { value: 'public', label: '대중교통', icon: 'bus-outline' },
];

export function TransportScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setTransport } = usePlanning();

  const next = () => navigation.navigate('Loading');
  const enabled = plan.transport !== null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChevronBackButton />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>어떻게 이동하나요?</Text>
        <Text style={styles.subtitle}>이동수단에 맞춰 코스를 짜드려요</Text>

        <View style={styles.grid}>
          {OPTIONS.map(({ value, label, icon }) => {
            const selected = plan.transport === value;
            return (
              <Pressable
                key={value}
                onPress={() => setTransport(value)}
                style={[styles.card, selected && styles.cardSelected]}
              >
                <Ionicons
                  name={icon}
                  size={48}
                  color={selected ? colors.textStrong : colors.textSecondary}
                />
                <Text style={styles.cardText}>{label}</Text>
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
    paddingBottom: spacing.xxl,
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
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.card,
    backgroundColor: colors.cardDefault,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
    fontSize: 20,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  bottom: {
    marginTop: 'auto',
    gap: spacing.sm,
  },
});
