import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoogleCourseMap } from '../../components/planning/GoogleCourseMap';
import { getPlaceDisplayTitle } from '../../api/places';
import {
  createScheduledItinerary,
  type ItineraryResponse,
  type ItineraryLeg,
  type ItineraryRequest,
} from '../../api/itinerary';
import { decodeGooglePolyline } from '../../api/routes';
import type { RoutePoint } from '../../api/routes';
import { useOnboarding } from '../../lib/onboardingStore';
import { usePlanning } from '../../lib/planningStore';
import { getPlanningDays, reconcilePlaceDays } from '../../lib/placeSchedule';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CoursePreview'>;
type Transport = ItineraryRequest['transport'];
function formatLegSummary(leg: ItineraryLeg) {
  const minutes = Math.max(1, Math.round(leg.durationMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const duration = hours ? `${hours}시간${remainder ? ` ${remainder}분` : ''}` : `${minutes}분`;
  const transport = leg.summary
    .replace(/(?:약\s*)?\d+\s*분(?:\s*소요)?/g, '')
    .replace(/\s*·\s*$/, '')
    .trim();
  return `${transport || leg.mode} · ${duration}`;
}
export function CoursePreviewScreen() {
  const navigation = useNavigation<Nav>();
  const { saveTrip } = useOnboarding();
  const { plan } = usePlanning();
  const regionName = plan.selectedRegion?.name ?? '여행지';
  const dayCount = getPlanningDays(plan.dateRange, plan.noSpecificDate);
  const duration = dayCount === 1 ? '당일' : `${dayCount - 1}박 ${dayCount}일`;
  const [selectedDay, setSelectedDay] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const [transport, setTransport] = useState<Transport>('대중교통');
  const [transportOpen, setTransportOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState<{ points: RoutePoint[]; key: number } | null>(null);
  const itineraryCache = useRef(new Map<string, ItineraryResponse>());
  const scheduledDays = useMemo(
    () => reconcilePlaceDays(plan.selectedPlaceIds, dayCount, plan.selectedPlaceDays),
    [plan.selectedPlaceIds, dayCount, plan.selectedPlaceDays],
  );
  const scheduleKey = useMemo(
    () => scheduledDays.map((day) => day.join(',')).join('|'),
    [scheduledDays],
  );
  const allPlaces = useMemo(
    () => [
      ...(plan.placeRecommendations?.core ?? []),
      ...(plan.placeRecommendations?.suggestions ?? []),
    ],
    [plan.placeRecommendations],
  );
  const places = useMemo(
    () =>
      (scheduledDays[selectedDay] ?? []).flatMap((id) => {
        const place = allPlaces.find((p) => p.contentId === id);
        return place ? [place] : [];
      }),
    [scheduledDays, selectedDay, allPlaces],
  );
  const items = useMemo(() => itinerary?.days[selectedDay]?.items ?? [], [itinerary, selectedDay]);
  const mapPlaces = useMemo(
    () =>
      places
        .map((place) => ({
          contentId: place.contentId,
          title: getPlaceDisplayTitle(place.title, regionName),
          latitude: Number(place.mapy),
          longitude: Number(place.mapx),
        }))
        .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)),
    [places, regionName],
  );
  const routePaths = useMemo(
    () =>
      items.flatMap((item) =>
        item.legToNext?.encodedPolyline
          ? [decodeGooglePolyline(item.legToNext.encodedPolyline)]
          : [],
      ),
    [items],
  );
  const connectionPaths = useMemo(
    () =>
      loading
        ? []
        : places.slice(0, -1).flatMap((place, index) => {
            if (
              items.find((item) => item.place.contentId === place.contentId)?.legToNext
                ?.encodedPolyline
            )
              return [];
            const next = places[index + 1];
            return [
              [
                { lat: Number(place.mapy), lng: Number(place.mapx) },
                { lat: Number(next.mapy), lng: Number(next.mapx) },
              ],
            ];
          }),
    [loading, places, items],
  );
  useEffect(() => {
    if (selectedDay >= dayCount) setSelectedDay(0);
  }, [dayCount, selectedDay]);
  useEffect(() => {
    let active = true;
    const cacheKey = `${scheduleKey}:${transport}`;
    const cached = itineraryCache.current.get(cacheKey);
    if (cached) {
      setItinerary(cached);
      setLoading(false);
      setError(null);
      setSaved(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    setError(null);
    setItinerary(null);
    setSaved(false);
    createScheduledItinerary(scheduledDays, transport)
      .then((result) => {
        if (active) {
          itineraryCache.current.set(cacheKey, result);
          setItinerary(result);
        }
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : '경로를 불러오지 못했어요.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [scheduledDays, scheduleKey, transport, retry]);
  const save = () => {
    if (!itinerary || saved) return;
    const title = `${regionName} · ${duration}`;
    saveTrip({
      title,
      desc: `${plan.selectedPlaceIds.length}곳 · ${transport}`,
      image: allPlaces.find((p) => p.imageUrl)?.imageUrl ?? '',
      regionName,
      course: {
        purpose: '직접 고른 여행',
        title,
        summary: `${plan.selectedPlaceIds.length}곳을 담은 여행`,
        days: itinerary.days.map((day) => ({
          day: day.day,
          visits: day.items.map((item, index) => ({
            order: index + 1,
            name: getPlaceDisplayTitle(item.place.title, regionName),
            description:
              allPlaces.find((p) => p.contentId === item.place.contentId)?.reason ??
              item.place.addr1,
            latitude: item.place.mapy,
            longitude: item.place.mapx,
            transportToNext: item.legToNext
              ? {
                  mode: item.legToNext.mode,
                  durationMinutes: item.legToNext.durationMinutes,
                  note: item.legToNext.summary,
                }
              : null,
          })),
        })),
      },
    });
    setSaved(true);
  };
  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('SelectionReview')}
          hitSlop={12}
          accessibilityLabel="선택한 장소 수정"
        >
          <Ionicons name="chevron-back" size={25} color="#252725" />
        </Pressable>
        <Text style={styles.headerText}>최종 일정</Text>
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
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{regionName}</Text>
            <Text style={styles.duration}>{duration}</Text>
          </View>
          <View style={styles.transportWrap}>
            <Pressable
              style={styles.transportButton}
              onPress={() => setTransportOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel={`이동수단 선택, 현재 ${transport}`}
            >
              <Text style={styles.transportButtonText}>{transport}</Text>
              <Ionicons
                name={transportOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#77766F"
              />
            </Pressable>
            {transportOpen && (
              <View style={styles.transportMenu}>
                {(['대중교통', '자동차'] as Transport[]).map((option) => (
                  <Pressable
                    key={option}
                    style={styles.transportOption}
                    onPress={() => {
                      setTransport(option);
                      setTransportOpen(false);
                      setMapFocus(null);
                    }}
                    accessibilityRole="menuitem"
                  >
                    <Text
                      style={[
                        styles.transportOptionText,
                        transport === option && styles.activeTransportText,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.tabs, dayCount <= 4 && styles.expandedTabs]}
        >
          {scheduledDays.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedDay(index);
                setMapFocus(null);
              }}
              style={[
                styles.tab,
                dayCount <= 4 && styles.equalTab,
                selectedDay === index && styles.activeTab,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedDay === index }}
            >
              <Text style={[styles.tabText, selectedDay === index && styles.activeText]}>
                DAY {index + 1}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <GoogleCourseMap
          places={mapPlaces}
          routePaths={routePaths}
          connectionPaths={connectionPaths}
          focus={mapFocus}
        />
        {loading && <Text style={styles.status}>{transport} 경로를 확인하고 있어요.</Text>}
        {error && (
          <View>
            <Text style={styles.status}>{error}</Text>
            <Pressable onPress={() => setRetry((n) => n + 1)}>
              <Text style={styles.retry}>경로 다시 불러오기</Text>
            </Pressable>
          </View>
        )}
        {!places.length && <Text style={styles.status}>이 날짜에는 선택한 장소가 없어요.</Text>}
        <View style={styles.list}>
          {places.map((place, index) => {
            const leg = items.find((item) => item.place.contentId === place.contentId)?.legToNext;
            return (
              <View key={place.contentId}>
                <View style={styles.placeCard}>
                  <Pressable
                    style={styles.placeMapButton}
                    onPress={() =>
                      setMapFocus({
                        points: [{ lat: Number(place.mapy), lng: Number(place.mapx) }],
                        key: Date.now(),
                      })
                    }
                    accessibilityLabel={`${getPlaceDisplayTitle(place.title, regionName)} 지도에서 보기`}
                  >
                    <View style={styles.imageWrap}>
                      {place.imageUrl ? (
                        <Image source={{ uri: place.imageUrl }} style={styles.image} />
                      ) : (
                        <Ionicons
                          name={place.purpose.includes('카페') ? 'cafe-outline' : 'image-outline'}
                          size={23}
                          color="#24443A"
                        />
                      )}
                    </View>
                    <View style={styles.placeBody}>
                      <Text style={styles.placeName}>
                        {index + 1} · {getPlaceDisplayTitle(place.title, regionName)}
                      </Text>
                      <Text style={styles.purpose}>{place.purpose}</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.detailButton}
                    onPress={() =>
                      navigation.navigate('PlaceDetail', { contentId: place.contentId })
                    }
                    hitSlop={8}
                    accessibilityLabel={`${getPlaceDisplayTitle(place.title, regionName)} 상세보기`}
                  >
                    <Text style={styles.detailText}>상세보기</Text>
                    <Ionicons name="chevron-forward" size={14} color="#77766F" />
                  </Pressable>
                </View>
                {index < places.length - 1 && (
                  <Pressable
                    style={styles.leg}
                    onPress={() => {
                      const next = places[index + 1];
                      const points = leg?.encodedPolyline
                        ? decodeGooglePolyline(leg.encodedPolyline)
                        : [
                            { lat: Number(place.mapy), lng: Number(place.mapx) },
                            { lat: Number(next.mapy), lng: Number(next.mapx) },
                          ];
                      setMapFocus({ points, key: Date.now() });
                    }}
                    accessibilityLabel={`${index + 1}번과 ${index + 2}번 사이 이동 경로 지도에서 보기`}
                  >
                    <Text style={styles.legText}>
                      {leg
                        ? formatLegSummary(leg)
                        : loading
                          ? '이동 시간 확인 중...'
                          : '이동 정보 없음'}
                    </Text>
                    {leg && (
                      <Text style={styles.distance}>
                        {(leg.distanceMeters / 1000).toFixed(1)}km
                      </Text>
                    )}
                    <Ionicons name="expand-outline" size={13} color="#998354" />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.editButton} onPress={() => navigation.navigate('SelectionReview')}>
          <Text style={styles.editText}>수정하기</Text>
        </Pressable>
        <Pressable
          disabled={!itinerary || loading || saved}
          style={[styles.saveButton, (!itinerary || loading) && styles.disabled]}
          onPress={save}
        >
          <Text style={styles.saveText}>{saved ? '저장됨 ✓' : '저장하기'}</Text>
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
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 15,
    paddingBottom: 22,
    gap: 8,
  },
  headerText: { flex: 1, fontSize: 12, color: '#77766F' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingBottom: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 58,
    marginBottom: 12,
    zIndex: 10,
  },
  title: { fontSize: 25, lineHeight: 32, fontWeight: '700', color: '#252725' },
  duration: { marginTop: 1, fontSize: 11, color: '#77766F' },
  transportWrap: { alignItems: 'flex-end', position: 'relative', zIndex: 20 },
  transportButton: {
    minWidth: 98,
    minHeight: 34,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE9E1',
  },
  transportButtonText: { fontSize: 11, color: '#77766F' },
  transportMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 98,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE9E1',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  transportOption: { paddingHorizontal: 11, paddingVertical: 8 },
  transportOptionText: { fontSize: 11, color: '#77766F' },
  activeTransportText: { color: '#C28A45', fontWeight: '700' },
  tabs: {
    backgroundColor: '#EFEEE7',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 9,
    padding: 3,
    marginBottom: 13,
  },
  expandedTabs: { flexGrow: 1 },
  tab: {
    minWidth: 65,
    paddingHorizontal: 13,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 7,
  },
  equalTab: { flex: 1, minWidth: 0, paddingHorizontal: 5 },
  activeTab: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 10, color: '#77766F' },
  activeText: { fontWeight: '700', color: '#24443A' },
  list: { marginTop: 11 },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 67,
  },
  placeMapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  detailButton: {
    minWidth: 65,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  detailText: { fontSize: 10, color: '#77766F' },
  imageWrap: {
    width: 43,
    height: 43,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0EDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  placeBody: { flex: 1 },
  placeName: { fontSize: 13, lineHeight: 19, fontWeight: '700', color: '#252725' },
  purpose: { fontSize: 11, color: '#77766F', marginTop: 4 },
  leg: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
  },
  legText: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 16,
    color: '#998354',
  },
  distance: { fontSize: 10, color: '#77766F' },
  status: { fontSize: 12, lineHeight: 18, color: '#77766F', paddingVertical: 12 },
  retry: { fontSize: 12, color: '#24443A', paddingBottom: 10 },
  footer: {
    flexDirection: 'row',
    gap: 13,
    paddingHorizontal: 28,
    paddingTop: 7,
    paddingBottom: 24,
  },
  editButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#EFEEEC',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { fontSize: 14, fontWeight: '700', color: '#77766F' },
  saveButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
});
