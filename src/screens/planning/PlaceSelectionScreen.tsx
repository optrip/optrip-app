import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { getPlaceDisplayTitle, type PlaceSummary } from '../../api/places';
import { useOnboarding } from '../../lib/onboardingStore';
import { usePlanning } from '../../lib/planningStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PlaceSelection'>;

const MAX_PLACES = 7;

export function PlaceSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useOnboarding();
  const { plan, setSelectedPlaceIds } = usePlanning();
  const suggestions = plan.placeRecommendations?.suggestions ?? [];
  const purposes = [...new Set(suggestions.map((place) => place.purpose))];
  const [selectedPurpose, setSelectedPurpose] = useState(purposes[0] ?? '');

  const selectedPlaces = useMemo(() => {
    const allPlaces = [
      ...(plan.placeRecommendations?.core ?? []),
      ...(plan.placeRecommendations?.suggestions ?? []),
    ];

    return plan.selectedPlaceIds
      .map((contentId) => allPlaces.find((place) => place.contentId === contentId))
      .filter((place): place is PlaceSummary => Boolean(place));
  }, [plan.placeRecommendations, plan.selectedPlaceIds]);

  const visibleSuggestions = suggestions.filter((place) => place.purpose === selectedPurpose);
  const regionName = plan.selectedRegion?.name;
  const displayName = profile.name || 'ㅇㅇ';

  const removePlace = (contentId: string) => {
    setSelectedPlaceIds(plan.selectedPlaceIds.filter((id) => id !== contentId));
  };

  const togglePlace = (contentId: string) => {
    if (plan.selectedPlaceIds.includes(contentId)) {
      removePlace(contentId);
      return;
    }

    if (plan.selectedPlaceIds.length < MAX_PLACES) {
      setSelectedPlaceIds([...plan.selectedPlaceIds, contentId]);
    }
  };

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>방문할 장소들</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedPlaces.length}</Text>
          </View>
        </View>
        <Text style={styles.limitText}>최대 {MAX_PLACES}개까지 담을 수 있어요</Text>

        <View style={styles.selectedList}>
          {selectedPlaces.map((place) => (
            <View key={place.contentId} style={styles.selectedRow}>
              <Text style={styles.selectedTitle} numberOfLines={1}>
                {getPlaceDisplayTitle(place.title, regionName)}
              </Text>
              <Pressable
                onPress={() => navigation.navigate('PlaceDetail', { contentId: place.contentId })}
                style={styles.detailButton}
              >
                <Text style={styles.detailText}>자세히 보기</Text>
                <Ionicons name="chevron-forward" size={15} color="#333333" />
              </Pressable>
              <Pressable onPress={() => removePlace(place.contentId)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#B1B1B1" />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.suggestionTitle}>{displayName}님이 좋아하실 장소들</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {purposes.map((purpose) => {
            const selected = purpose === selectedPurpose;
            return (
              <Pressable
                key={purpose}
                onPress={() => setSelectedPurpose(purpose)}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{purpose}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.suggestionList}>
          {visibleSuggestions.map((place) => {
            const selected = plan.selectedPlaceIds.includes(place.contentId);
            const limitReached = !selected && plan.selectedPlaceIds.length >= MAX_PLACES;

            return (
              <View
                key={place.contentId}
                style={[styles.suggestionRow, limitReached && styles.disabled]}
              >
                {place.imageUrl ? (
                  <Image source={{ uri: place.imageUrl }} style={styles.suggestionImage} />
                ) : (
                  <View style={[styles.suggestionImage, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color="#999999" />
                  </View>
                )}
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {getPlaceDisplayTitle(place.title, regionName)}
                  </Text>
                  <Text style={styles.suggestionReason} numberOfLines={1}>
                    {place.reason}
                  </Text>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('PlaceDetail', { contentId: place.contentId })
                      }
                      style={styles.smallButton}
                    >
                      <Text style={styles.smallButtonText}>자세히 보기</Text>
                      <Ionicons name="chevron-forward" size={14} color="#333333" />
                    </Pressable>
                    <Pressable
                      disabled={limitReached}
                      onPress={() => togglePlace(place.contentId)}
                      style={[styles.smallButton, selected && styles.selectedButton]}
                    >
                      <Text style={styles.smallButtonText}>
                        {selected ? '코스에서 빼기' : '코스에 추가'}
                      </Text>
                      <Ionicons
                        name={selected ? 'checkmark-circle-outline' : 'add-circle-outline'}
                        size={15}
                        color={selected ? '#BF6570' : '#333333'}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <Pressable style={styles.saveButton} onPress={() => navigation.navigate('CoursePreview')}>
          <Text style={styles.saveText}>이대로 경로 저장하기</Text>
          <Ionicons name="chevron-forward" size={27} color="#959A5C" />
        </Pressable>
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
  content: { paddingHorizontal: 48, paddingTop: 14, paddingBottom: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 23, fontWeight: '600', color: '#111111' },
  countBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F1D8DE',
  },
  countText: { fontSize: 15, color: '#B86D7A' },
  limitText: { marginTop: 7, fontSize: 13, color: '#A5A5A5' },
  selectedList: { marginTop: 25, gap: 16 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedTitle: { flex: 1, fontSize: 22, fontWeight: '600', color: '#111111' },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DFA5AE',
    borderRadius: 18,
  },
  detailText: { fontSize: 11, color: '#222222' },
  divider: { height: 1, marginTop: 34, marginBottom: 30, backgroundColor: '#E2DED6' },
  suggestionTitle: { fontSize: 20, fontWeight: '600', color: '#222222' },
  tabs: { gap: 8, paddingTop: 16, paddingBottom: 18 },
  tab: {
    minWidth: 78,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#ECECEC',
  },
  tabSelected: { backgroundColor: '#EFE2C9' },
  tabText: { fontSize: 13, color: '#A0A0A0' },
  tabTextSelected: { color: '#5A5142' },
  suggestionList: { gap: 18 },
  suggestionRow: { minHeight: 88, flexDirection: 'row', gap: 14 },
  disabled: { opacity: 0.45 },
  suggestionImage: { width: 86, height: 86, borderRadius: 7, backgroundColor: '#E5E5E5' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  suggestionContent: { flex: 1 },
  suggestionName: { fontSize: 20, fontWeight: '600', color: '#111111' },
  suggestionReason: { marginTop: 2, fontSize: 12, color: '#555555' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C8C49E',
    borderRadius: 16,
  },
  selectedButton: { borderColor: '#DFA5AE', backgroundColor: '#F8E5E9' },
  smallButtonText: { fontSize: 10, color: '#333333' },
  bottomArea: { paddingHorizontal: 48, paddingBottom: 27, paddingTop: 8 },
  saveButton: {
    height: 64,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#AEB278',
    backgroundColor: '#D8DBC1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  saveText: { fontSize: 22, fontWeight: '500', color: '#111111' },
});
