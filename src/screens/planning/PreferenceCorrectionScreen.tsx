import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { PREFERENCE_LABEL } from '../../lib/labels';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList, Preference } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PreferenceCorrection'>;
const MAX_SELECT = 3;
const OPTIONS: { value: Preference; label: string }[] = [
  { value: 'sea', label: '바다' },
  { value: 'hiking', label: '하이킹' },
  { value: 'food', label: '맛집' },
  { value: 'history', label: '역사/문화' },
  { value: 'activity', label: '액티비티' },
  { value: 'nature', label: '자연/풍경' },
  { value: 'healing', label: '힐링' },
  { value: 'cafe', label: '카페투어' },
  { value: 'market', label: '시장/먹거리' },
  { value: 'culture', label: '문화체험' },
];

export function PreferenceCorrectionScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setPreferences, setInterpretation } = usePlanning();
  const [selected, setSelected] = useState<Preference[]>(() => {
    const understood = plan.interpretation?.purposes ?? [];
    return OPTIONS.filter(({ value }) => understood.includes(PREFERENCE_LABEL[value]))
      .slice(0, MAX_SELECT)
      .map(({ value }) => value);
  });
  const isCorrection = Boolean(plan.interpretation?.purposes.length);

  const toggle = (value: Preference) => {
    setSelected((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (current.length >= MAX_SELECT) return current;
      return [...current, value];
    });
  };

  const submit = () => {
    setPreferences(selected);
    setInterpretation(null);
    navigation.navigate('RegionCandidates');
  };

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={22} color="#262B28" />
        </Pressable>
        <Text style={styles.headerTitle}>취향 다시 고르기</Text>
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
        <Text style={styles.title}>원하는 여행을 골라주세요</Text>
        <Text style={styles.subtitle}>
          {isCorrection
            ? '이해한 취향을 바꾸고 싶다면 직접 골라주세요.'
            : '여행 취향을 충분히 이해하지 못했어요. 직접 골라주세요.'}
          {'\n'}최대 3개까지 선택할 수 있어요.
        </Text>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>이번 추천에 반영할 취향</Text>
          <Text style={styles.noticeText}>
            {selected.length > 0
              ? selected.map((value) => PREFERENCE_LABEL[value]).join(' · ')
              : '아래에서 취향을 선택해주세요.'}
          </Text>
        </View>

        <View style={styles.grid}>
          {OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value);
            const unavailable = !isSelected && selected.length >= MAX_SELECT;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: unavailable }}
                disabled={unavailable}
                onPress={() => toggle(option.value)}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  unavailable && styles.unavailable,
                ]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark" size={18} color="#24443A" style={styles.checkmark} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.helper}>선택한 취향으로 다음 추천을 이어갈게요.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={submit}
          disabled={selected.length === 0}
          style={[styles.nextButton, selected.length === 0 && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextText}>선택한 취향으로 추천받기</Text>
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
  iconButton: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 13, color: '#5C625D' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 31, paddingTop: 29, paddingBottom: 28 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#262B28' },
  subtitle: { marginTop: 9, fontSize: 12, lineHeight: 18, color: '#727872' },
  notice: {
    marginTop: 20,
    minHeight: 55,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#EAF4F1',
  },
  noticeTitle: { fontSize: 11, color: '#66736D' },
  noticeText: { marginTop: 5, fontSize: 12, color: '#24443A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 25 },
  option: {
    width: '48.3%',
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E7E0D8',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: { borderColor: '#24443A', backgroundColor: '#EAF4F1' },
  unavailable: { opacity: 0.55 },
  optionLabel: { fontSize: 13, color: '#6E746E' },
  optionLabelSelected: { fontWeight: '600', color: '#24443A' },
  checkmark: { position: 'absolute', right: 12 },
  helper: { marginTop: 27, fontSize: 11, color: '#737A74' },
  footer: { paddingHorizontal: 31, paddingTop: 9, paddingBottom: 24, backgroundColor: '#FCFAF7' },
  nextButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#24443A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextButtonDisabled: { opacity: 0.55 },
  nextText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
