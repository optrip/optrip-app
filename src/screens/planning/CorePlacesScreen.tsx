import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { getPlaceDisplayTitle, recommendPlaces, type PlaceSummary } from '../../api/places';
import { PREFERENCE_LABEL } from '../../lib/labels';
import { getPlanningDays, MAX_PLACES_PER_DAY } from '../../lib/placeSchedule';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CorePlaces'>;
export function CorePlacesScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setPlaceRecommendations, setSelectedPlaceIds } = usePlanning();
  const [loading, setLoading] = useState(!plan.placeRecommendations);
  const [error, setError] = useState<string | null>(null);
  const loadPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!plan.selectedRegion) throw new Error('선택한 지역이 없어요.');
      const response = await recommendPlaces({
        lDongRegnCd: plan.selectedRegion.lDongRegnCd,
        lDongSignguCd: plan.selectedRegion.lDongSignguCd,
        purposes: plan.interpretation?.purposes ?? plan.preferences.map((p) => PREFERENCE_LABEL[p]),
      });
      setPlaceRecommendations(response);
    } catch {
      setError('장소 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!plan.placeRecommendations) void loadPlaces();
    // 처음 진입할 때만 가져오고, 선택을 바꿀 때는 서버를 호출하지 않습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const places = plan.placeRecommendations?.core ?? [];
  const first = places[0];
  const regionName = plan.selectedRegion?.name ?? '여행지';
  const limit = getPlanningDays(plan.dateRange, plan.noSpecificDate) * MAX_PLACES_PER_DAY;
  const toggle = (id: string) => {
    if (plan.selectedPlaceIds.includes(id))
      setSelectedPlaceIds(plan.selectedPlaceIds.filter((item) => item !== id));
    else if (plan.selectedPlaceIds.length < limit)
      setSelectedPlaceIds([...plan.selectedPlaceIds, id]);
  };
  const picture = (place: PlaceSummary, large: boolean) => (
    <View style={large ? styles.heroImage : styles.smallImage}>
      {place.imageUrl ? (
        <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <Ionicons name="image-outline" size={30} color="#86988C" />
      )}
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="chevron-back" size={27} color="#252725" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          accessibilityLabel="홈으로 가기"
        >
          <Ionicons name="home-outline" size={27} color="#252725" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{regionName}에서 꼭 보고 싶은 곳</Text>
        <Text style={styles.subtitle}>1곳만 골라도 일정이 만들어져요.</Text>
        {loading ? (
          <ActivityIndicator color="#24443A" />
        ) : error ? (
          <View>
            <Text style={styles.message}>{error}</Text>
            <Pressable onPress={loadPlaces}>
              <Text style={styles.link}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {!places.length && (
              <Text style={styles.message}>
                대표 장소가 아직 없어요. 장소 더 둘러보기에서 찾아보세요.
              </Text>
            )}
            {first && (
              <View
                style={[
                  styles.hero,
                  plan.selectedPlaceIds.includes(first.contentId) && styles.selectedCard,
                ]}
              >
                <View>
                  {picture(first, true)}
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>MUST VISIT</Text>
                  </View>
                  {plan.selectedPlaceIds.includes(first.contentId) && (
                    <View style={styles.selectionCheck}>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.heroBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.heroName}>
                      {getPlaceDisplayTitle(first.title, regionName)}
                    </Text>
                    <Text style={styles.purpose}>{first.purpose}</Text>
                  </View>
                  <Text style={styles.reason}>{first.reason}</Text>
                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.selectButton,
                        plan.selectedPlaceIds.includes(first.contentId) && styles.selectedButton,
                      ]}
                      onPress={() => toggle(first.contentId)}
                      disabled={
                        !plan.selectedPlaceIds.includes(first.contentId) &&
                        plan.selectedPlaceIds.length >= limit
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: plan.selectedPlaceIds.includes(first.contentId),
                      }}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          plan.selectedPlaceIds.includes(first.contentId) && styles.selectedText,
                        ]}
                      >
                        {plan.selectedPlaceIds.includes(first.contentId)
                          ? '선택됨 ✓'
                          : '이 장소 선택하기'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.infoButton}
                      onPress={() =>
                        navigation.navigate('PlaceDetail', { contentId: first.contentId })
                      }
                      accessibilityLabel={`${first.title} 자세히 보기`}
                    >
                      <Ionicons name="information-circle-outline" size={25} color="#24443A" />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            <View style={styles.smallGrid}>
              {places.slice(1).map((place) => {
                const selected = plan.selectedPlaceIds.includes(place.contentId);
                return (
                  <View
                    key={place.contentId}
                    style={[
                      styles.smallCard,
                      places.length === 2 && styles.wideCard,
                      selected && styles.selectedCard,
                    ]}
                  >
                    <Pressable
                      onPress={() => toggle(place.contentId)}
                      accessibilityRole="button"
                      accessibilityLabel={`${getPlaceDisplayTitle(place.title, regionName)} ${selected ? '선택 해제' : '선택'}`}
                      accessibilityState={{ selected }}
                      disabled={!selected && plan.selectedPlaceIds.length >= limit}
                    >
                      {picture(place, false)}
                      {selected && (
                        <View style={styles.selectionCheck}>
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={styles.smallBody}>
                        <Text style={styles.smallName}>
                          {getPlaceDisplayTitle(place.title, regionName)}
                        </Text>
                        <Text style={styles.purpose}>{place.purpose}</Text>
                        <Text style={styles.smallSelection}>
                          {selected ? '선택됨 ✓' : '눌러서 선택하기'}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('PlaceDetail', { contentId: place.contentId })
                      }
                      style={styles.smallDetail}
                    >
                      <Text style={styles.link}>자세히 보기 ›</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      {!loading && !error && (
        <View style={styles.footer}>
          <Pressable
            disabled={!plan.selectedPlaceIds.length}
            style={[styles.confirmButton, !plan.selectedPlaceIds.length && styles.disabled]}
            onPress={() => navigation.navigate('SelectionReview')}
          >
            <Text style={styles.confirmText}>선택한 장소 확인하기</Text>
          </Pressable>
          <Pressable
            style={styles.browseButton}
            onPress={() => navigation.navigate('PlaceSelection')}
          >
            <Text style={styles.link}>장소 더 둘러보기</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  selectionCheck: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: { flex: 1, backgroundColor: '#FCFAF7' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 18,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24 },
  heading: { fontSize: 25, lineHeight: 34, fontWeight: '700', color: '#252725' },
  subtitle: { marginTop: 6, marginBottom: 26, fontSize: 15, color: '#77766F' },
  message: { fontSize: 14, lineHeight: 22, color: '#77766F' },
  hero: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  heroImage: {
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEE8',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  badgeText: { color: '#CD593C', fontSize: 11, fontWeight: '700' },
  heroBody: { padding: 15 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  heroName: { fontSize: 23, lineHeight: 31, color: '#252725', flexShrink: 1 },
  purpose: {
    fontSize: 10,
    color: '#77766F',
    backgroundColor: '#F6EFE0',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reason: { marginTop: 13, fontSize: 12, lineHeight: 19, color: '#77766F' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  selectButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: { backgroundColor: '#24443A' },
  selectText: { fontSize: 14, fontWeight: '700', color: '#24443A' },
  selectedText: { color: '#FFFFFF' },
  infoButton: {
    width: 47,
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 30 },
  smallCard: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  wideCard: { width: '100%' },
  selectedCard: { borderColor: '#24443A' },
  smallImage: {
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEE8',
  },
  smallBody: { padding: 11, gap: 5 },
  smallName: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: '#252725' },
  smallSelection: { fontSize: 11, color: '#24443A', marginTop: 3 },
  smallDetail: { alignSelf: 'flex-end', paddingHorizontal: 11, paddingBottom: 11 },
  link: { fontSize: 12, fontWeight: '600', color: '#24443A' },
  footer: { flexShrink: 0, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 19 },
  confirmButton: {
    minHeight: 53,
    borderRadius: 11,
    backgroundColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  browseButton: { alignItems: 'center', paddingTop: 14, paddingBottom: 6 },
});
