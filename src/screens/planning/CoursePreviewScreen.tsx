import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GoogleCourseMap } from '../../components/planning/GoogleCourseMap';
import { getPlaceDisplayTitle, type PlaceSummary } from '../../api/places';
import { useOnboarding } from '../../lib/onboardingStore';
import { usePlanning } from '../../lib/planningStore';
import { buildCourseSchedule } from '../../lib/buildCourseSchedule';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CoursePreview'>;
const EMPTY_PLACES: PlaceSummary[] = [];

export function CoursePreviewScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useOnboarding();
  const { plan, setTransport } = usePlanning();
  const regionName = plan.selectedRegion?.name ?? '여행지';
  const displayName = profile.name || '여행자';
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedTransport = plan.transport ?? 'public';

  const selectedPlaces = useMemo(() => {
    const recommendations = plan.placeRecommendations;
    const allPlaces = [...(recommendations?.core ?? []), ...(recommendations?.suggestions ?? [])];
    return plan.selectedPlaceIds
      .map((contentId) => allPlaces.find((place) => place.contentId === contentId))
      .filter((place): place is PlaceSummary => Boolean(place));
  }, [plan.placeRecommendations, plan.selectedPlaceIds]);

  const courseDays = useMemo(
    () =>
      buildCourseSchedule(
        selectedPlaces,
        plan.placeRecommendations?.core ?? [],
        plan.dateRange,
        plan.noSpecificDate,
      ),
    [plan.dateRange, plan.noSpecificDate, plan.placeRecommendations?.core, selectedPlaces],
  );
  const selectedDay = courseDays[selectedDayIndex] ?? courseDays[0];
  const visiblePlaces = selectedDay?.places ?? EMPTY_PLACES;

  useEffect(() => {
    if (selectedDayIndex >= courseDays.length) setSelectedDayIndex(0);
  }, [courseDays.length, selectedDayIndex]);

  const mapPlaces = useMemo(
    () =>
      visiblePlaces.map((place) => ({
        contentId: place.contentId,
        title: getPlaceDisplayTitle(place.title, regionName),
        latitude: place.mapy,
        longitude: place.mapx,
      })),
    [regionName, visiblePlaces],
  );

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={30} color="#222222" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="home-outline" size={29} color="#222222" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {displayName}님의 {regionName} 여행 코스
        </Text>
        <View style={styles.transportRow}>
          <Text style={styles.transportLabel}>이동 수단 선택</Text>
          <View style={styles.transportButtons}>
            <Pressable
              onPress={() => setTransport('public')}
              style={[
                styles.transportChip,
                selectedTransport === 'public' && styles.transportChipSelected,
              ]}
            >
              <Text
                style={[styles.chipText, selectedTransport === 'public' && styles.chipTextSelected]}
              >
                대중교통
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTransport('car')}
              style={[
                styles.transportChip,
                selectedTransport === 'car' && styles.transportChipSelected,
              ]}
            >
              <Text
                style={[styles.chipText, selectedTransport === 'car' && styles.chipTextSelected]}
              >
                자동차
              </Text>
            </Pressable>
          </View>
        </View>

        <GoogleCourseMap places={mapPlaces} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {courseDays.map((day, index) => {
            const selected = index === selectedDayIndex;
            return (
              <Pressable
                key={`${day.dayNumber}-${day.date ?? 'undecided'}`}
                onPress={() => setSelectedDayIndex(index)}
                style={[styles.dayTab, selected && styles.dayTabSelected]}
              >
                <Text style={selected ? styles.daySelectedText : styles.dayText}>
                  DAY {day.dayNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.courseCard}>
          {visiblePlaces.length === 0 ? (
            <Text style={styles.emptyText}>이 날짜에 배치할 장소가 아직 없어요.</Text>
          ) : null}
          {visiblePlaces.map((place, index) => (
            <View key={place.contentId} style={styles.placeRow}>
              <View style={styles.timelineColumn}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
              </View>
              <View style={styles.placeTextArea}>
                <Text style={styles.placeTitle}>
                  {getPlaceDisplayTitle(place.title, regionName)}
                </Text>
                <Text style={styles.placeReason}>{place.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F7F2' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 36, paddingTop: 8, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '600', color: '#111111' },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  transportLabel: { marginRight: 5, fontSize: 16, color: '#555555' },
  transportButtons: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#E3E0D9',
  },
  transportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  transportChipSelected: { backgroundColor: '#E9CFD5' },
  chipText: { fontSize: 13, color: '#666666' },
  chipTextSelected: { fontWeight: '600', color: '#6F4B55' },
  dayTabs: { alignItems: 'flex-end', marginTop: 18, paddingHorizontal: 16 },
  dayTab: {
    width: 108,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#EDE4D2',
  },
  dayTabSelected: { height: 49, backgroundColor: '#F3EFE5' },
  dayText: { fontSize: 14, color: '#999999' },
  daySelectedText: { fontSize: 14, fontWeight: '700', color: '#111111' },
  courseCard: {
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderRadius: 25,
    backgroundColor: '#F3EFE5',
  },
  emptyText: { paddingVertical: 24, textAlign: 'center', fontSize: 14, color: '#888888' },
  placeRow: { minHeight: 94, flexDirection: 'row', gap: 14, paddingBottom: 24 },
  timelineColumn: { position: 'relative', alignItems: 'center' },
  numberCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#A92F50',
  },
  numberText: { fontSize: 18, color: '#FFFFFF' },
  placeTextArea: { flex: 1 },
  placeTitle: { fontSize: 19, fontWeight: '600', color: '#111111' },
  placeReason: { marginTop: 6, fontSize: 13, lineHeight: 18, color: '#555555' },
});
