import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { interpretTravel } from '../../api/interpret';
import { COMPANION_LABEL, PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'InterpretationReview'>;

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
      text: plan.wantToDo.trim() || purposes.join(', '),
      dates,
      companion: plan.companion ? COMPANION_LABEL[plan.companion] : '',
      destinations: plan.destinations,
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
    plan.wantToDo,
    plan.destinations,
    setInterpretation,
  ]);

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color="#252725" />
        </Pressable>
        <Text style={styles.headerTitle}>해석 확인</Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="home-outline" size={22} color="#262B28" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>당신의 여행을{'\n'}이렇게 이해했어요</Text>
        <Text style={styles.subtitle}>실제 추천에 반영될 조건을 한 번만 확인해주세요.</Text>

        <View style={styles.summaryBox}>
          {loading ? <ActivityIndicator color="#9A9D66" /> : null}
          {error ? <Text style={styles.summary}>{error}</Text> : null}
          {!loading && !error ? (
            <>
              <Text style={styles.summary}>{plan.interpretation?.summary ?? ''}</Text>
              <Text style={styles.summaryCaption}>
                내가 쓴 표현을 추천 가능한 조건으로 정리했어요.
              </Text>
            </>
          ) : null}
        </View>

        {!loading && !error && plan.interpretation ? (
          <>
            <Text style={styles.sectionTitle}>이번 추천에 반영할 취향</Text>
            <View style={styles.chips}>
              {plan.interpretation.purposes.map((purpose) => (
                <View key={purpose} style={styles.chip}>
                  <Text style={styles.chipText}>{purpose}</Text>
                </View>
              ))}
            </View>

            {plan.interpretation.mappings && plan.interpretation.mappings.length > 0 ? (
              <View style={styles.mappingsBox}>
                {plan.interpretation.mappings.map((mapping, index) => (
                  <View key={`${mapping.phrase}-${index}`} style={styles.mappingRow}>
                    <Text style={styles.phrase} numberOfLines={2}>
                      “{mapping.phrase}”
                    </Text>
                    <Text style={styles.mappingResult} numberOfLines={2}>
                      → {mapping.purposes.join(' · ')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, (loading || Boolean(error)) && styles.disabledButton]}
          disabled={loading || Boolean(error)}
          onPress={() => navigation.navigate('PreferenceCorrection')}
        >
          <Text style={styles.actionText}>직접 수정하기</Text>
          <Ionicons name="chevron-forward" size={19} color="#262B28" />
        </Pressable>
        <Pressable
          style={[
            styles.actionButton,
            styles.primaryButton,
            (loading || Boolean(error)) && styles.disabledButton,
          ]}
          disabled={loading || Boolean(error)}
          onPress={() => navigation.navigate('RegionCandidates')}
        >
          <Text style={styles.primaryText}>이 조건으로 추천받기</Text>
          <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  headerTitle: { fontSize: 13, color: '#5C625D' },
  iconButton: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    color: '#262B28',
  },
  subtitle: {
    marginTop: 13,
    fontSize: 12,
    lineHeight: 17,
    color: '#747974',
  },
  summaryBox: {
    marginTop: 20,
    minHeight: 154,
    paddingHorizontal: 15,
    paddingVertical: 23,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  summary: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '500',
    color: '#252925',
  },
  summaryCaption: { marginTop: 15, fontSize: 11, color: '#737A74' },
  sectionTitle: { marginTop: 27, fontSize: 12, color: '#363C36' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 15, backgroundColor: '#EAF4F1' },
  chipText: { fontSize: 11, color: '#24443A' },
  mappingsBox: {
    marginTop: 21,
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    gap: 17,
  },
  mappingRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  phrase: { flex: 1, fontSize: 12, lineHeight: 17, color: '#252925' },
  mappingResult: { flex: 1, fontSize: 12, lineHeight: 17, color: '#24443A' },
  actions: {
    paddingHorizontal: 28,
    paddingTop: 9,
    paddingBottom: 24,
    gap: 9,
    backgroundColor: '#FCFAF7',
  },
  actionButton: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#262B28' },
  primaryButton: { borderColor: '#24443A', backgroundColor: '#24443A' },
  primaryText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  disabledButton: { opacity: 0.55 },
});
