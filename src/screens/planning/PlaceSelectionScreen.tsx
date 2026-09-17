import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PlaceChoiceCard } from '../../components/planning/PlaceChoiceCard';
import { getPlanningDays, MAX_PLACES_PER_DAY } from '../../lib/placeSchedule';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PlaceSelection'>;
export function PlaceSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setSelectedPlaceIds } = usePlanning();
  const suggestions = plan.placeRecommendations?.suggestions ?? [];
  const purposes = [...new Set(suggestions.map((p) => p.purpose))];
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const limit = getPlanningDays(plan.dateRange, plan.noSpecificDate) * MAX_PLACES_PER_DAY;
  const visible = suggestions.filter((p) => !selectedPurpose || p.purpose === selectedPurpose);
  const toggle = (id: string) => {
    if (plan.selectedPlaceIds.includes(id))
      setSelectedPlaceIds(plan.selectedPlaceIds.filter((item) => item !== id));
    else if (plan.selectedPlaceIds.length < limit)
      setSelectedPlaceIds([...plan.selectedPlaceIds, id]);
  };
  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="chevron-back" size={25} color="#252725" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          accessibilityLabel="홈으로 가기"
        >
          <Ionicons name="home-outline" size={25} color="#252725" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>원하는 장소만 담아보세요</Text>
        <Text style={styles.subtitle}>
          현재 {plan.selectedPlaceIds.length}곳 선택 · DAY별 최대 5곳
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {[null, ...purposes].map((purpose) => (
            <Pressable
              key={purpose ?? 'all'}
              onPress={() => setSelectedPurpose(purpose)}
              style={[styles.tab, selectedPurpose === purpose && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedPurpose === purpose && styles.activeTabText]}>
                {purpose ?? '전체'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.list}>
          {visible.map((place) => (
            <PlaceChoiceCard
              key={place.contentId}
              place={place}
              regionName={plan.selectedRegion?.name}
              selected={plan.selectedPlaceIds.includes(place.contentId)}
              disabled={
                !plan.selectedPlaceIds.includes(place.contentId) &&
                plan.selectedPlaceIds.length >= limit
              }
              onToggle={() => toggle(place.contentId)}
              onDetail={() => navigation.navigate('PlaceDetail', { contentId: place.contentId })}
            />
          ))}
          {!visible.length && <Text style={styles.empty}>이 취향의 추천 장소가 아직 없어요.</Text>}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          disabled={!plan.selectedPlaceIds.length}
          style={[styles.confirm, !plan.selectedPlaceIds.length && styles.disabled]}
          onPress={() => navigation.navigate('SelectionReview')}
        >
          <Text style={styles.confirmText}>선택한 장소 확인하기</Text>
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
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 20,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 13, paddingBottom: 24 },
  title: { fontSize: 19, lineHeight: 27, fontWeight: '500', color: '#252725' },
  subtitle: { marginTop: 14, fontSize: 12, color: '#77766F' },
  tabs: { gap: 7, paddingTop: 28, paddingBottom: 16 },
  tab: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  activeTab: { backgroundColor: '#24443A', borderColor: '#24443A' },
  tabText: { fontSize: 11, color: '#77766F' },
  activeTabText: { color: '#FFFFFF' },
  list: { gap: 11 },
  empty: { fontSize: 13, lineHeight: 20, color: '#77766F' },
  footer: { paddingHorizontal: 28, paddingTop: 10, paddingBottom: 24 },
  confirm: {
    minHeight: 48,
    backgroundColor: '#24443A',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
});
