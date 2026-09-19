import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { GoogleCourseMap } from '../../components/planning/GoogleCourseMap';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CourseDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'CourseDetail'>;

function formatDuration(minutes: number) {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded}분`;
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return `${hours}시간${remainder ? ` ${remainder}분` : ''}`;
}

export function CourseDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { plan } = usePlanning();
  const course = params.savedCourse ?? plan.courses?.courses[params.courseIndex];
  const regionName =
    params.savedRegionName ?? plan.courses?.regionName ?? plan.result?.regionName ?? '';
  const [selectedDay, setSelectedDay] = useState(0);

  const day = course?.days[selectedDay] ?? course?.days[0];
  const mapPlaces = useMemo(
    () =>
      (day?.visits ?? []).map((visit) => ({
        contentId: `${day?.day ?? 1}-${visit.order}`,
        title: visit.name,
        latitude: visit.latitude,
        longitude: visit.longitude,
        order: visit.order,
      })),
    [day],
  );
  const connectionPaths = useMemo(
    () =>
      (day?.visits ?? []).slice(0, -1).map((visit, index) => [
        { lat: visit.latitude, lng: visit.longitude },
        {
          lat: day!.visits[index + 1].latitude,
          lng: day!.visits[index + 1].longitude,
        },
      ]),
    [day],
  );

  if (!course || !day) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>저장된 여행 정보를 찾을 수 없어요.</Text>
          <Pressable onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeText}>홈으로 돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#252725" />
        </Pressable>
        <Text style={styles.headerText}>저장한 여행</Text>
        <Pressable
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          hitSlop={12}
        >
          <Ionicons name="home-outline" size={25} color="#252725" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {regionName} ·{' '}
          {course.days.length === 1
            ? '당일'
            : `${course.days.length - 1}박 ${course.days.length}일`}
        </Text>
        <Text style={styles.summary}>{course.summary}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {course.days.map((item, index) => (
            <Pressable
              key={item.day}
              style={[styles.tab, selectedDay === index && styles.activeTab]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.tabText, selectedDay === index && styles.activeTabText]}>
                DAY {item.day}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <GoogleCourseMap places={mapPlaces} connectionPaths={connectionPaths} />

        <View style={styles.list}>
          {day.visits.map((visit, index) => (
            <View key={`${visit.order}-${visit.name}`}>
              <View style={styles.placeCard}>
                <View style={styles.placeIcon}>
                  <Text style={styles.placeNumber}>{visit.order}</Text>
                </View>
                <View style={styles.placeBody}>
                  <Text style={styles.placeName}>
                    {visit.order} · {visit.name}
                  </Text>
                  <Text style={styles.placeDescription} numberOfLines={2}>
                    {visit.description}
                  </Text>
                </View>
              </View>
              {visit.transportToNext && index < day.visits.length - 1 ? (
                <View style={styles.legRow}>
                  <Ionicons
                    name={
                      visit.transportToNext.mode.includes('자동차')
                        ? 'car-outline'
                        : 'navigate-outline'
                    }
                    size={13}
                    color="#998354"
                  />
                  <Text style={styles.legText}>
                    {visit.transportToNext.mode} ·{' '}
                    {formatDuration(visit.transportToNext.durationMinutes)}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 15,
    paddingBottom: 18,
    gap: 10,
  },
  headerText: { flex: 1, fontSize: 12, color: '#77766F' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingBottom: 28 },
  title: { fontSize: 25, fontWeight: '700', color: '#252725' },
  summary: { marginTop: 6, marginBottom: 15, fontSize: 12, color: '#77766F' },
  tabs: {
    minWidth: '100%',
    padding: 3,
    marginBottom: 11,
    borderRadius: 10,
    backgroundColor: '#F0EDE5',
  },
  tab: { minWidth: 92, flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 },
  activeTab: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 10, color: '#77766F' },
  activeTabText: { fontWeight: '700', color: '#24443A' },
  list: { marginTop: 11 },
  placeCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  placeIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEE8',
  },
  placeNumber: { fontSize: 15, fontWeight: '700', color: '#24443A' },
  placeBody: { flex: 1 },
  placeName: { fontSize: 14, fontWeight: '700', color: '#252725' },
  placeDescription: { marginTop: 5, fontSize: 10, lineHeight: 15, color: '#77766F' },
  legRow: {
    minHeight: 37,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  legText: { fontSize: 10, fontWeight: '600', color: '#998354' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  empty: { fontSize: 14, color: '#77766F' },
  homeText: { fontSize: 13, fontWeight: '600', color: '#24443A' },
});
