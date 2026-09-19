import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  createScheduledItinerary,
  type ItineraryRequest,
  type ItineraryResponse,
} from '../../api/itinerary';
import { decodeGooglePolyline } from '../../api/routes';
import { GoogleCourseMap } from '../../components/planning/GoogleCourseMap';
import { useOnboarding } from '../../lib/onboardingStore';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CourseDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'CourseDetail'>;
type Transport = ItineraryRequest['transport'];

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
  const { savedTrips, saveTripItinerary } = useOnboarding();
  const savedTrip = savedTrips.find((trip) => trip.id === params.savedTripId);
  const course =
    savedTrip?.course ?? params.savedCourse ?? plan.courses?.courses[params.courseIndex];
  const regionName =
    savedTrip?.regionName ??
    params.savedRegionName ??
    plan.courses?.regionName ??
    plan.result?.regionName ??
    '';
  const [selectedDay, setSelectedDay] = useState(0);
  const [transport, setTransport] = useState<Transport>(savedTrip?.initialTransport ?? '대중교통');
  const [transportOpen, setTransportOpen] = useState(false);
  const [temporaryItinerary, setTemporaryItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itinerary = savedTrip?.itineraries?.[transport] ?? temporaryItinerary;

  useEffect(() => {
    setTemporaryItinerary(null);
    setSelectedDay(0);
    if (!savedTrip?.placeDays || savedTrip.itineraries?.[transport]) return;
    let active = true;
    setLoading(true);
    setError(null);
    createScheduledItinerary(savedTrip.placeDays, transport)
      .then((result) => {
        if (!active) return;
        setTemporaryItinerary(result);
        saveTripItinerary(savedTrip.id, transport, result);
      })
      .catch(() => active && setError(`${transport} 경로를 불러오지 못했어요.`))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [saveTripItinerary, savedTrip, transport]);

  const dayCount = itinerary?.days.length ?? course?.days.length ?? 0;
  const itineraryDay = itinerary?.days[selectedDay] ?? itinerary?.days[0];
  const legacyDay = course?.days[selectedDay] ?? course?.days[0];
  const places = useMemo(
    () =>
      itineraryDay
        ? itineraryDay.items.map((item, index) => ({
            id: item.place.contentId,
            title: item.place.title,
            description: item.place.addr1,
            imageUrl: item.place.imageUrl,
            latitude: item.place.mapy,
            longitude: item.place.mapx,
            order: index + 1,
            leg: item.legToNext,
          }))
        : (legacyDay?.visits ?? []).map((visit) => ({
            id: `${legacyDay?.day ?? 1}-${visit.order}`,
            title: visit.name,
            description: visit.description,
            imageUrl: null,
            latitude: visit.latitude,
            longitude: visit.longitude,
            order: visit.order,
            leg: visit.transportToNext
              ? {
                  mode: visit.transportToNext.mode,
                  summary: visit.transportToNext.note,
                  durationMinutes: visit.transportToNext.durationMinutes,
                  distanceMeters: 0,
                  encodedPolyline: undefined,
                }
              : undefined,
          })),
    [itineraryDay, legacyDay],
  );
  const mapPlaces = useMemo(
    () =>
      places.map((place) => ({
        contentId: place.id,
        title: place.title,
        latitude: place.latitude,
        longitude: place.longitude,
        order: place.order,
      })),
    [places],
  );
  const routePaths = useMemo(
    () =>
      places
        .map((place) => place.leg?.encodedPolyline)
        .filter((polyline): polyline is string => Boolean(polyline))
        .map(decodeGooglePolyline),
    [places],
  );
  const connectionPaths = useMemo(
    () =>
      places.slice(0, -1).flatMap((place, index) =>
        place.leg?.encodedPolyline
          ? []
          : [
              [
                { lat: place.latitude, lng: place.longitude },
                { lat: places[index + 1].latitude, lng: places[index + 1].longitude },
              ],
            ],
      ),
    [places],
  );

  if (!course) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>저장된 여행 정보를 찾을 수 없어요.</Text>
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
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{regionName}</Text>
            <Text style={styles.summary}>
              {dayCount === 1 ? '당일' : `${dayCount - 1}박 ${dayCount}일`}
            </Text>
          </View>
          <View style={styles.transportWrap}>
            <Pressable
              style={styles.transportButton}
              onPress={() => setTransportOpen((open) => !open)}
            >
              <Text style={styles.transportText}>{transport}</Text>
              <Ionicons
                name={transportOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#77766F"
              />
            </Pressable>
            {transportOpen ? (
              <View style={styles.transportMenu}>
                {(['대중교통', '자동차'] as Transport[]).map((option) => (
                  <Pressable
                    key={option}
                    style={styles.transportOption}
                    onPress={() => {
                      setTransport(option);
                      setTransportOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.transportOptionText,
                        option === transport && styles.activeTransport,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {Array.from({ length: dayCount }, (_, index) => (
            <Pressable
              key={index}
              style={[styles.tab, selectedDay === index && styles.activeTab]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.tabText, selectedDay === index && styles.activeTabText]}>
                DAY {index + 1}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <GoogleCourseMap
          places={mapPlaces}
          routePaths={routePaths}
          connectionPaths={connectionPaths}
        />
        {loading ? (
          <Text style={styles.status}>{transport} 경로를 처음 한 번 불러오고 있어요.</Text>
        ) : null}
        {error ? <Text style={styles.status}>{error}</Text> : null}

        <View style={styles.list}>
          {places.map((place, index) => (
            <View key={place.id}>
              <View style={styles.placeCard}>
                <View style={styles.placeImageWrap}>
                  {place.imageUrl ? (
                    <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
                  ) : (
                    <Text style={styles.placeNumber}>{place.order}</Text>
                  )}
                </View>
                <View style={styles.placeBody}>
                  <Text style={styles.placeName}>
                    {place.order} · {place.title}
                  </Text>
                  <Text style={styles.placeDescription} numberOfLines={1}>
                    {place.description}
                  </Text>
                </View>
              </View>
              {place.leg && index < places.length - 1 ? (
                <View style={styles.legRow}>
                  <Text style={styles.legText}>
                    {place.leg.mode} · {formatDuration(place.leg.durationMinutes)}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  title: { fontSize: 25, fontWeight: '700', color: '#252725' },
  summary: { marginTop: 5, fontSize: 12, color: '#77766F' },
  transportWrap: { position: 'relative', alignItems: 'flex-end' },
  transportButton: {
    minWidth: 90,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  transportText: { fontSize: 11, color: '#77766F' },
  transportMenu: {
    position: 'absolute',
    top: 38,
    right: 0,
    width: 100,
    padding: 4,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    zIndex: 10,
  },
  transportOption: { paddingVertical: 9, alignItems: 'center' },
  transportOptionText: { fontSize: 11, color: '#77766F' },
  activeTransport: { fontWeight: '700', color: '#24443A' },
  tabs: {
    minWidth: '100%',
    padding: 3,
    marginTop: 14,
    marginBottom: 11,
    borderRadius: 10,
    backgroundColor: '#F0EDE5',
  },
  tab: { minWidth: 92, flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 },
  activeTab: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 10, color: '#77766F' },
  activeTabText: { fontWeight: '700', color: '#24443A' },
  status: { marginTop: 8, textAlign: 'center', fontSize: 10, color: '#77766F' },
  list: { marginTop: 11 },
  placeCard: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  placeImageWrap: {
    width: 43,
    height: 43,
    borderRadius: 9,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEE8',
  },
  placeImage: { width: '100%', height: '100%' },
  placeNumber: { fontSize: 15, fontWeight: '700', color: '#24443A' },
  placeBody: { flex: 1 },
  placeName: { fontSize: 14, fontWeight: '700', color: '#252725' },
  placeDescription: { marginTop: 5, fontSize: 10, color: '#77766F' },
  legRow: { minHeight: 37, alignItems: 'center', justifyContent: 'center' },
  legText: { fontSize: 10, fontWeight: '600', color: '#998354' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 14, color: '#77766F' },
});
