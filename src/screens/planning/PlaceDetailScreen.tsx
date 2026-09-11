import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
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
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PlaceDetail'>;
type Rt = RouteProp<OnboardingStackParamList, 'PlaceDetail'>;

export function PlaceDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { plan } = usePlanning();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      setPlace(await getPlaceDetail(params.contentId));
    } catch {
      setError('장소 상세 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
    // 장소 번호가 바뀌면 해당 장소를 다시 불러옵니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.contentId]);

  return (
    <SafeAreaView
      style={[styles.safe, Platform.OS === 'web' && styles.webSafe]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={30} color="#222222" />
        </Pressable>
        <Text style={styles.headerTitle}>자세히 보기</Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="home-outline" size={29} color="#222222" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerMessage}>
          <ActivityIndicator color="#9A9D66" />
          <Text style={styles.messageText}>상세 정보를 불러오고 있어요</Text>
        </View>
      ) : error || !place ? (
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>{error ?? '장소 정보가 없어요.'}</Text>
          <Pressable onPress={loadDetail} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.hero}>
            <ImageBackground
              source={{ uri: place.imageUrl }}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            />

            <View style={styles.detailPanel}>
              <Text style={styles.placeTitle}>
                {getPlaceDisplayTitle(place.title, plan.selectedRegion?.name)}
              </Text>
              <View style={styles.divider} />
              <ScrollView
                style={styles.detailScroll}
                contentContainerStyle={styles.detailScrollContent}
                showsVerticalScrollIndicator
              >
                <Text style={styles.overview}>{place.overview}</Text>

                <View style={styles.infoList}>
                  <InfoRow label="이용 시간" value={place.useTime} />
                  <InfoRow label="휴무일" value={place.restDate} />
                  <InfoRow label="주차" value={place.parking} />
                  <InfoRow label="이용 요금" value={place.fee} />
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F7F2' },
  webSafe: { marginTop: -56, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: { fontSize: 21, fontWeight: '600', color: '#111111' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 45, paddingTop: 92, paddingBottom: 40 },
  hero: { minHeight: 560, position: 'relative' },
  heroImage: {
    height: 315,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D28B98',
    backgroundColor: '#E5E5E5',
    shadowColor: '#7E5860',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  heroImageStyle: { borderRadius: 25 },
  detailPanel: {
    position: 'absolute',
    top: 195,
    left: 0,
    right: 0,
    height: 365,
    paddingHorizontal: 32,
    paddingTop: 27,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#C1C394',
    borderRadius: 27,
    backgroundColor: '#F9F7F2',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    zIndex: 1,
  },
  placeTitle: { fontSize: 31, lineHeight: 39, fontWeight: '600', color: '#111111' },
  divider: { height: 2, width: '82%', marginTop: 14, backgroundColor: '#BF6570' },
  detailScroll: { marginTop: 18 },
  detailScrollContent: { paddingRight: 8, paddingBottom: 12 },
  overview: { fontSize: 15, lineHeight: 21, color: '#333333' },
  infoList: { marginTop: 24, gap: 10 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoLabel: { width: 68, fontSize: 13, fontWeight: '600', color: '#555555' },
  infoValue: { flex: 1, fontSize: 13, lineHeight: 18, color: '#555555' },
  centerMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  messageText: { fontSize: 15, color: '#6F6F6F' },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#D8DBC1',
  },
  retryText: { fontSize: 14, color: '#333333' },
});
