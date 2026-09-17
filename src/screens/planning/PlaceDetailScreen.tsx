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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDetail, getPlaceDisplayTitle, type PlaceDetail } from '../../api/places';
import { getPlanningDays, MAX_PLACES_PER_DAY } from '../../lib/placeSchedule';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PlaceDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'PlaceDetail'>;
const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();

export function PlaceDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { plan, setSelectedPlaceIds } = usePlanning();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setPlace(null);
    setLoading(true);
    setError(null);
    getPlaceDetail(params.contentId)
      .then((result) => {
        if (active) setPlace(result);
      })
      .catch(() => {
        if (active) setError('장소 상세 정보를 불러오지 못했어요.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.contentId, retry]);
  const summary = [
    ...(plan.placeRecommendations?.core ?? []),
    ...(plan.placeRecommendations?.suggestions ?? []),
  ].find((item) => item.contentId === params.contentId);
  const selected = plan.selectedPlaceIds.includes(params.contentId);
  const full =
    !selected &&
    plan.selectedPlaceIds.length >=
      getPlanningDays(plan.dateRange, plan.noSpecificDate) * MAX_PLACES_PER_DAY;
  const toggle = () => {
    if (selected)
      setSelectedPlaceIds(plan.selectedPlaceIds.filter((id) => id !== params.contentId));
    else if (!full) setSelectedPlaceIds([...plan.selectedPlaceIds, params.contentId]);
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
        <Text style={styles.headerTitle}>장소 상세</Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          accessibilityLabel="홈으로 가기"
        >
          <Ionicons name="home-outline" size={25} color="#252725" />
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#24443A" />
          <Text style={styles.message}>상세 정보를 불러오고 있어요.</Text>
        </View>
      ) : error || !place ? (
        <View style={styles.center}>
          <Text style={styles.message}>{error ?? '장소 정보가 없어요.'}</Text>
          <Pressable onPress={() => setRetry((value) => value + 1)}>
            <Text style={styles.retry}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.imageWrap}>
                {place.imageUrl ? (
                  <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <Ionicons name="image-outline" size={35} color="#86988C" />
                )}
              </View>
              <View style={styles.heroBody}>
                <Text style={styles.title}>
                  {getPlaceDisplayTitle(place.title, plan.selectedRegion?.name)}
                </Text>
                {summary?.reason && <Text style={styles.caption}>{plainText(summary.reason)}</Text>}
              </View>
            </View>
            <View style={styles.infoCard}>
              <InfoRow label="운영" value={place.useTime} />
              <InfoRow label="입장" value={place.fee} />
              <InfoRow label="위치" value={place.addr1} />
              <InfoRow label="휴무" value={place.restDate} />
              <InfoRow label="주차" value={place.parking} />
              <InfoRow label="전화" value={place.tel} />
            </View>
            <Text style={styles.sectionTitle}>상세 정보</Text>
            <View style={styles.overviewCard}>
              <Text style={styles.overview}>
                {place.overview ? plainText(place.overview) : '상세 설명이 아직 없어요.'}
              </Text>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable
              style={[styles.addButton, full && styles.disabled]}
              disabled={full || !summary}
              onPress={toggle}
            >
              <Text style={styles.addText}>
                {selected
                  ? '일정에 추가됨 ✓ · 눌러서 빼기'
                  : full
                    ? 'DAY별 최대 5곳까지 담을 수 있어요'
                    : '이 장소를 일정에 추가하기'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{plainText(value)}</Text>
    </View>
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
    paddingBottom: 20,
    gap: 8,
  },
  headerTitle: { flex: 1, fontSize: 13, color: '#77766F' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingBottom: 25 },
  hero: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imageWrap: {
    height: 150,
    backgroundColor: '#E9EEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  heroBody: { padding: 15 },
  title: { fontSize: 21, lineHeight: 29, color: '#252725' },
  caption: { marginTop: 8, fontSize: 12, lineHeight: 19, color: '#77766F' },
  infoCard: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 15,
    gap: 12,
  },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoLabel: { width: 45, fontSize: 11, color: '#77766F', lineHeight: 18 },
  infoValue: { flex: 1, fontSize: 12, lineHeight: 18, color: '#252725' },
  sectionTitle: {
    marginTop: 13,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#252725',
  },
  overviewCard: {
    borderWidth: 1,
    borderColor: '#E4DDD5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  overview: { fontSize: 11, lineHeight: 22, color: '#77766F' },
  footer: { paddingHorizontal: 28, paddingTop: 5, paddingBottom: 24 },
  addButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#24443A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  message: { fontSize: 13, color: '#77766F' },
  retry: { fontSize: 13, color: '#24443A', fontWeight: '600' },
});
