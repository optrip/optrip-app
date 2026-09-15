import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { interpretTravel } from '../../api/interpret';
import { COMPANION_LABEL, PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'InterpretationReview'>;

const SUBTITLE = ['일정을 만들기 전에', '잘못 이해한 부분이 없는지 확인해주세요.'].join('\n');

export function InterpretationReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setInterpretation } = usePlanning();
  const [loading, setLoading] = useState(!plan.interpretation);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan.interpretation) return;
    let active = true;
    const purposes = plan.preferences.map((preference) => PREFERENCE_LABEL[preference]);
    const dates = [plan.dateRange.start, plan.dateRange.end].filter((date): date is string =>
      Boolean(date),
    );

    interpretTravel({
      text: purposes.join(', '),
      dates,
      companion: plan.companion ? COMPANION_LABEL[plan.companion] : '',
      destinations: [],
    })
      .then((result) => {
        if (!active) return;
        setInterpretation(result);
        if (result.purposes.length === 0) navigation.replace('PreferenceCorrection');
      })
      .catch(() => active && setError('여행 내용을 해석하지 못했어요.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [
    navigation,
    plan.companion,
    plan.dateRange.end,
    plan.dateRange.start,
    plan.interpretation,
    plan.preferences,
    setInterpretation,
  ]);

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={32} color="#222222" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="home-outline" size={32} color="#222222" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>이렇게 이해했어요</Text>
        <Text style={styles.subtitle}>{SUBTITLE}</Text>

        <View style={styles.summaryBox}>
          {loading ? <ActivityIndicator color="#9A9D66" /> : null}
          {error ? <Text style={styles.summary}>{error}</Text> : null}
          {!loading && !error ? (
            <Text style={styles.summary}>{plan.interpretation?.summary ?? ''}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            disabled={loading || Boolean(error)}
            onPress={() => navigation.navigate('PreferenceCorrection')}
          >
            <Text style={styles.actionText}>잘못 이해했어요</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            disabled={loading || Boolean(error)}
            onPress={() => navigation.navigate('RegionCandidates')}
          >
            <Text style={styles.actionText}>제대로 이해했어요</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9F7F2',
  },
  webSafe: {
    marginTop: -56,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 58,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    textAlign: 'center',
  },
  summaryBox: {
    width: '100%',
    marginTop: 38,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#A9AD70',
    borderRadius: 28,
    backgroundColor: '#E8E9D9',
    alignItems: 'center',
  },
  summary: {
    fontSize: 21,
    lineHeight: 27,
    color: '#111111',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 88,
    paddingBottom: 24,
    gap: 10,
  },
  actionButton: {
    width: '100%',
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#A9AD70',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F7F2',
  },
  actionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
  },
});
