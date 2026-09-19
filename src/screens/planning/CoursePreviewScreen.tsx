import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  type ItineraryRouteStep,
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
  const steps = leg.steps ?? [];
  if (!steps.length || leg.mode === '자동차') {
    return `${leg.mode} ${Math.max(1, Math.round(leg.durationMinutes))}분`;
  }
  const walk = steps
    .filter((step) => step.mode === '도보')
    .reduce((sum, step) => sum + step.durationMinutes, 0);
  const transit = steps
    .filter((step) => step.mode === '버스' || step.mode === '지하철')
    .reduce((sum, step) => sum + step.durationMinutes, 0);
  const parts = [];
  if (transit) parts.push(`대중교통 ${transit}분`);
  if (walk) parts.push(`도보 ${walk}분`);
  return parts.join(' · ') || `${leg.mode} ${Math.max(1, Math.round(leg.durationMinutes))}분`;
}

function formatDuration(minutes: number) {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded}분`;
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return `${hours}시간${remainder ? ` ${remainder}분` : ''}`;
}

function mergeRouteSteps(steps: ItineraryRouteStep[]) {
  return steps.reduce<ItineraryRouteStep[]>((merged, step) => {
    const previous = merged[merged.length - 1];
    if (previous?.mode === '도보' && step.mode === '도보') {
      merged[merged.length - 1] = {
        ...previous,
        durationMinutes: previous.durationMinutes + step.durationMinutes,
        distanceMeters: previous.distanceMeters + step.distanceMeters,
      };
    } else {
      merged.push({ ...step });
    }
    return merged;
  }, []);
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
  const [mapFocus, setMapFocus] = useState<{
    points: RoutePoint[];
    placeIds: string[];
    connection: boolean;
    key: number;
  } | null>(null);
  const [detailLeg, setDetailLeg] = useState<{
    leg: ItineraryLeg;
    from: string;
    to: string;
  } | null>(null);
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
        .map((place, index) => ({
          contentId: place.contentId,
          title: getPlaceDisplayTitle(place.title, regionName),
          latitude: Number(place.mapy),
          longitude: Number(place.mapx),
          order: index + 1,
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
  const visibleMapPlaces = useMemo(
    () =>
      mapFocus
        ? mapPlaces.filter((place) => mapFocus.placeIds.includes(place.contentId))
        : mapPlaces,
    [mapFocus, mapPlaces],
  );
  const visibleRoutePaths = mapFocus && !mapFocus.connection ? [mapFocus.points] : routePaths;
  const visibleConnectionPaths = mapFocus
    ? mapFocus.connection
      ? [mapFocus.points]
      : []
    : connectionPaths;
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

  const detailSteps = detailLeg?.leg.steps?.length
    ? mergeRouteSteps(detailLeg.leg.steps)
    : [
        {
          mode: detailLeg?.leg.mode ?? '이동',
          durationMinutes: detailLeg?.leg.durationMinutes ?? 0,
          distanceMeters: detailLeg?.leg.distanceMeters ?? 0,
        },
      ];
  const displayedDetailTotal = detailSteps.reduce(
    (total, step) => total + Math.max(1, Math.round(step.durationMinutes)),
    0,
  );

  const routeDetailSheet = (
    <Pressable style={styles.modalSheet} onPress={() => undefined}>
      <View style={styles.modalHandle} />
      <View style={styles.modalHeader}>
        <View style={styles.modalTitleBody}>
          <Text style={styles.modalTitle}>이동 상세</Text>
          <Text style={styles.modalRoute} numberOfLines={1}>
            {detailLeg?.from} → {detailLeg?.to}
          </Text>
        </View>
        <Pressable onPress={() => setDetailLeg(null)} hitSlop={10}>
          <Ionicons name="close" size={23} color="#252725" />
        </Pressable>
      </View>
      <ScrollView style={styles.stepList} showsVerticalScrollIndicator={false}>
        {detailSteps.map((step, index) => (
          <View key={`${step.mode}-${index}`} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>
                {step.mode}
                {step.lineName ? ` ${step.lineName}` : ''} · {formatDuration(step.durationMinutes)}
              </Text>
              {step.departureStop && step.arrivalStop ? (
                <Text style={styles.stepDescription}>
                  {step.departureStop} → {step.arrivalStop}
                  {step.stopCount ? ` · ${step.stopCount}개 정류장` : ''}
                </Text>
              ) : step.mode === '도보' ? (
                <Text style={styles.stepDescription}>
                  도보 이동 · {(step.distanceMeters / 1000).toFixed(1)}km
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.modalTotal}>
        <Text style={styles.modalTotalLabel}>총 이동시간</Text>
        <Text style={styles.modalTotalValue}>{formatDuration(displayedDetailTotal)}</Text>
      </View>
    </Pressable>
  );

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
        <View style={styles.mapWrap}>
          <GoogleCourseMap
            places={visibleMapPlaces}
            routePaths={visibleRoutePaths}
            connectionPaths={visibleConnectionPaths}
            focus={mapFocus}
          />
          {mapFocus && (
            <Pressable style={styles.showAllButton} onPress={() => setMapFocus(null)}>
              <Ionicons name="map-outline" size={14} color="#24443A" />
              <Text style={styles.showAllText}>전체 일정 보기</Text>
            </Pressable>
          )}
        </View>
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
                <Pressable
                  style={styles.placeCard}
                  onPress={() => navigation.navigate('PlaceDetail', { contentId: place.contentId })}
                  accessibilityLabel={`${getPlaceDisplayTitle(place.title, regionName)} 상세보기`}
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
                  <Ionicons name="chevron-forward" size={17} color="#B3AFA7" />
                </Pressable>
                {index < places.length - 1 && (
                  <View style={styles.leg}>
                    <Pressable
                      style={styles.legMapButton}
                      onPress={() => {
                        const next = places[index + 1];
                        const points = leg?.encodedPolyline
                          ? decodeGooglePolyline(leg.encodedPolyline)
                          : [
                              { lat: Number(place.mapy), lng: Number(place.mapx) },
                              { lat: Number(next.mapy), lng: Number(next.mapx) },
                            ];
                        setMapFocus({
                          points,
                          placeIds: [place.contentId, next.contentId],
                          connection: !leg?.encodedPolyline,
                          key: Date.now(),
                        });
                      }}
                      accessibilityLabel={`${index + 1}번과 ${index + 2}번 사이 이동 경로 지도에서 보기`}
                    >
                      <View style={styles.legSummary}>
                        <Text style={styles.legText}>
                          {leg
                            ? formatLegSummary(leg)
                            : loading
                              ? '이동 시간 확인 중...'
                              : '이동 정보 없음'}
                        </Text>
                      </View>
                      <Ionicons name="expand-outline" size={13} color="#998354" />
                    </Pressable>
                    {leg && transport === '대중교통' && (
                      <Pressable
                        style={styles.legDetailButton}
                        onPress={() =>
                          setDetailLeg({
                            leg,
                            from: getPlaceDisplayTitle(place.title, regionName),
                            to: getPlaceDisplayTitle(places[index + 1].title, regionName),
                          })
                        }
                        accessibilityLabel={`${index + 1}번과 ${index + 2}번 사이 이동 상세보기`}
                      >
                        <Text style={styles.legDetailText}>자세히</Text>
                        <Ionicons name="chevron-forward" size={12} color="#77766F" />
                      </Pressable>
                    )}
                  </View>
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
      {Platform.OS === 'web' ? (
        detailLeg ? (
          <Pressable
            style={[styles.modalBackdrop, styles.webModalBackdrop]}
            onPress={() => setDetailLeg(null)}
          >
            {routeDetailSheet}
          </Pressable>
        ) : null
      ) : (
        <Modal
          visible={detailLeg !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setDetailLeg(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setDetailLeg(null)}>
            {routeDetailSheet}
          </Pressable>
        </Modal>
      )}
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
  mapWrap: { position: 'relative' },
  showAllButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  showAllText: { fontSize: 10, fontWeight: '600', color: '#24443A' },
  list: { marginTop: 11 },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 67,
  },
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
    alignItems: 'center',
    paddingVertical: 9,
  },
  legMapButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  legSummary: { flexShrink: 1, alignItems: 'center' },
  legText: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 16,
    color: '#998354',
  },
  legDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#E4DDD5',
  },
  legDetailText: { fontSize: 10, color: '#77766F' },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 21,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  webModalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '72%',
    paddingHorizontal: 24,
    paddingTop: 9,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FCFAF7',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    marginBottom: 17,
    borderRadius: 2,
    backgroundColor: '#D4D0C8',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 19 },
  modalTitleBody: { flex: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#252725' },
  modalRoute: { marginTop: 5, fontSize: 12, color: '#77766F' },
  stepList: { flexGrow: 0 },
  stepRow: { flexDirection: 'row', gap: 12, paddingBottom: 18 },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24443A',
  },
  stepNumberText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  stepBody: { flex: 1, paddingTop: 2 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#252725' },
  stepDescription: { marginTop: 5, fontSize: 11, lineHeight: 17, color: '#77766F' },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: '#E4DDD5',
  },
  modalTotalLabel: { fontSize: 13, color: '#77766F' },
  modalTotalValue: { fontSize: 14, fontWeight: '700', color: '#24443A' },
});
