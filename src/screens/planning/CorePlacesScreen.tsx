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

import { getPlaceDisplayTitle, recommendPlaces } from '../../api/places';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CorePlaces'>;

export function CorePlacesScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setPlaceRecommendations } = usePlanning();
  const [loading, setLoading] = useState(!plan.placeRecommendations);
  const [error, setError] = useState<string | null>(null);

  const loadPlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await recommendPlaces();
      setPlaceRecommendations(response);
    } catch {
      setError('장소 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!plan.placeRecommendations) void loadPlaces();
    // 처음 화면에 들어왔을 때 한 번만 요청합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const corePlaces = plan.placeRecommendations?.core ?? [];
  const selectedRegionName = plan.selectedRegion?.name;

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

      <View style={styles.content}>
        <Text style={styles.title}>꼭 가봐야할 곳들</Text>

        {loading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator color="#9A9D66" />
            <Text style={styles.messageText}>장소를 불러오고 있어요</Text>
          </View>
        ) : error ? (
          <View style={styles.centerMessage}>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable onPress={loadPlaces} style={styles.retryButton}>
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {corePlaces.map((place) => (
              <View key={place.contentId} style={styles.placeRow}>
                <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
                <View style={styles.placeContent}>
                  <View style={styles.placeHeading}>
                    <Text
                      style={styles.placeTitle}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.65}
                    >
                      {getPlaceDisplayTitle(place.title, selectedRegionName)}
                    </Text>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('PlaceDetail', { contentId: place.contentId })
                      }
                      style={styles.detailButton}
                    >
                      <Text style={styles.detailText}>자세히 보기</Text>
                      <Ionicons name="chevron-forward" size={16} color="#333333" />
                    </Pressable>
                  </View>
                  <Text style={styles.reason} numberOfLines={4}>
                    {place.reason}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {!loading && !error && (
          <Pressable onPress={() => navigation.navigate('PlaceSelection')} style={styles.addButton}>
            <Text style={styles.addButtonText}>방문할 장소 추가하기</Text>
            <Ionicons name="chevron-forward" size={28} color="#959A5C" />
          </Pressable>
        )}
      </View>
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
  content: { flex: 1, paddingHorizontal: 42, paddingTop: 106, paddingBottom: 34 },
  title: { fontSize: 34, lineHeight: 42, fontWeight: '700', color: '#111111', marginBottom: 34 },
  listScroll: { flex: 1 },
  list: { gap: 44, paddingBottom: 24 },
  placeRow: { minHeight: 118, flexDirection: 'row', gap: 16 },
  placeImage: { width: 90, height: 110, borderRadius: 10, backgroundColor: '#E5E5E5' },
  placeContent: { flex: 1, paddingTop: 2 },
  placeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    marginBottom: 7,
  },
  placeTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.7,
  },
  detailButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DFA5AE',
    borderRadius: 18,
  },
  detailText: { fontSize: 11, color: '#222222' },
  reason: { fontSize: 14, lineHeight: 19, color: '#333333' },
  centerMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  messageText: { fontSize: 15, color: '#6F6F6F' },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#D8DBC1',
  },
  retryText: { fontSize: 14, color: '#333333' },
  addButton: {
    height: 68,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#AEB278',
    backgroundColor: '#D8DBC1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  addButtonText: { fontSize: 23, fontWeight: '500', color: '#111111' },
});
